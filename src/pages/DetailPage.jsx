import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import MannequinHotspotSVG from "../components/MannequinSVG";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Label
} from "recharts";

import { ChevronLeft, Thermometer, Waves, Gauge, MapPin } from "lucide-react";

{/*Ubah Limit Disini*/ }
const SENSOR_META = {
    temp: { label: "Temperature", unit: "°C", Icon: Thermometer, backendType: "humidity", limit: 37 },
    vib: { label: "Vibration", unit: "g", Icon: Waves, backendType: "vibration", limit: 2.5 },
    press: { label: "Pressure", unit: "kPa", Icon: Gauge, backendType: "pressure", limit: 120 },
};

const PART_LABEL = {
    "right-arm": "Tangan Kanan",
    "left-arm": "Tangan Kiri",
    "right-leg": "Paha Kanan",
    "left-leg": "Paha Kiri",
    back: "Punggung",
};

const PARTS = ["left-arm", "right-arm", "left-leg", "right-leg", "back"];

// PERBAIKAN: Sesuaikan jumlah sensor per lokasi
const PART_SENSOR_COUNT = {
    "left-arm": 2,
    "right-arm": 2,
    "left-leg": 3,   // Paha kiri: 3 sensor
    "right-leg": 3,  // Paha kanan: 3 sensor
    back: 4,         // Punggung: 4 sensor
};

const LOCATION_MAP_BACKEND = {
    "right arm": "right-arm",
    "left arm": "left-arm",
    "right leg": "right-leg",
    "left leg": "left-leg",
    back: "back",
};

const SENSOR_COLOR = {
    1: "#10b981", // emerald
    2: "#3b82f6", // blue
    3: "#f59e0b", // amber
    4: "#10b981", // emerald
};

function fmt(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0";
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

const MS_1H = 60 * 60 * 1000;
const MS_24H = 24 * MS_1H;

function startOfDayLocal(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function buildHourTicksForDay(dayStart) {
    return Array.from({ length: 24 }, (_, i) => dayStart + i * MS_1H);
}

const MS_10M = 10 * 60 * 1000;
function build10MinTicksForDay(dayStart) {
    // 00:00 s/d 23:50 (144 ticks)
    return Array.from({ length: 24 * 6 }, (_, i) => dayStart + i * MS_10M);
}

function fmtHHmm(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function fmtHHmmss(ts) {
    if (!Number.isFinite(ts)) return "";
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}

// Single-row axis: major ticks on the hour, minor ticks every 10 minutes
function CombinedTimeTick({ x, y, payload }) {
    const ts = payload?.value;
    const d = new Date(ts);
    const isHour = d.getMinutes() === 0;

    return (
        <g transform={`translate(${x},${y})`}>
            <line
                x1={0}
                x2={0}
                y1={0}
                y2={isHour ? 10 : 6}
                stroke="#94a3b8"
                strokeWidth={1}
                opacity={isHour ? 0.9 : 0.55}
            />
            <text
                x={0}
                y={isHour ? 24 : 22}
                textAnchor="middle"
                fontSize={isHour ? 10 : 9}
                fontWeight={isHour ? 700 : 400}
                fill={isHour ? "#334155" : "#64748b"}
            >
                {fmtHHmm(ts)}
            </text>
        </g>
    );
}

const SimpleTimeTick = ({ x, y, payload }) => {
    const ts = payload?.value;
    return (
        <g transform={`translate(${x},${y})`}>
            <line x1={0} x2={0} y1={0} y2={6} stroke="#94a3b8" strokeWidth={1} opacity={0.8} />
            <text
                x={0}
                y={22}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill="#334155"
            >
                {fmtHHmm(ts)}
            </text>
        </g>
    );
};


function DotWithValue(props) {
    const { cx, cy, value, stroke } = props;
    if (cx == null || cy == null) return null;
    if (!Number.isFinite(Number(value))) return null;

    const color = stroke || "#334155";

    return (
        <g>
            <circle cx={cx} cy={cy} r={3} fill={color} stroke="#ffffff" strokeWidth={1} />
            <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                fontSize={10}
                fill="#334155"
                style={{ pointerEvents: "none" }}
            >
                {fmt(value)}
            </text>
        </g>
    );
}

function SensorTabs({ count, activeId, onChange }) {
    const ids = Array.from({ length: count }, (_, i) => i + 1);

    return (
        <div className="flex flex-wrap gap-2">
            {ids.map((id) => {
                const active = id === activeId;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        aria-pressed={active}
                        className={[
                            "px-3 py-2 rounded-xl text-sm font-semibold transition select-none",
                            active ? "neo-inset ring-2 ring-emerald-400/60" : "neo-surface hover:scale-[1.01]",
                            "active:translate-y-px active:scale-[0.99]",
                        ].join(" ")}
                    >
                        Sensor {id}
                    </button>
                );
            })}
        </div>
    );
}

function LocationPill({ label, currentObj, unit, count, active, onClick, threshold }) {

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={[
                "w-full h-full min-h-[132px] text-left rounded-2xl transition select-none",
                active ? "neo-inset" : "neo-surface hover:scale-[1.01]",
                "p-4",
                active ? "ring-2 ring-emerald-400/60" : "focus:ring-2 focus:ring-emerald-300/50",
                "active:translate-y-pxtive:scale-[0.99]",
                active ? "translate-y-px" : "",
            ].join(" ")}
        >

            <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-slate-900">{label}</div>
                <StatusBadge tone="ok" className="text-xs px-3 py-1">
                    OK
                </StatusBadge>
            </div>
            <div
                className={[
                    "mt-3 w-full overflow-hidden",
                    "grid gap-2",
                    count >= 3 ? "grid-cols-2" : "grid-cols-2",
                    "min-h-11"
                ].join(" ")}
            >


                {Array.from({ length: count }, (_, i) => i + 1).map((sid) => {
                    const raw = Number(currentObj?.[sid] ?? 0);
                    const isOver = Number.isFinite(raw) && Number.isFinite(threshold) && raw > threshold;

                    return (
                        <div
                            key={sid}
                            className={[
                                "neo-inset rounded-xl w-full",
                                "h-10 px-3",
                                "flex items-center justify-between gap-2",
                                isOver ? "ring-1 ring-red-400/60" : "",
                            ].join(" ")}
                        >
                            <div className="text-[11px] text-slate-500 font-medium shrink-0">
                                S{sid}
                            </div>

                            <div className="flex items-baseline gap-1 min-w-0 justify-end">
                                <span
                                    className={[
                                        "font-semibold tabular-nums truncate",
                                        count >= 3 ? "text-sm" : "text-base",
                                        isOver ? "text-red-600" : "text-slate-900",
                                    ].join(" ")}
                                >
                                    {fmt(raw)}
                                </span>

                                <span
                                    className={[
                                        "text-[11px] shrink-0",
                                        isOver ? "text-red-500" : "text-slate-500",
                                    ].join(" ")}
                                >
                                    {unit}
                                </span>
                            </div>
                        </div>
                    );
                })}


            </div>



            <div className="mt-2 text-xs text-slate-500">{active ? "Selected" : "Tap to focus"}</div>
        </button>
    );
}

function buildThresholdSeries(series, threshold) {
    const out = [];
    if (!Array.isArray(series) || series.length === 0) return out;

    const sorted = [...series].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

    for (let i = 0; i < sorted.length; i++) {
        const cur = sorted[i];
        const prev = sorted[i - 1];
        if (prev && Number.isFinite(prev.v) && Number.isFinite(cur.v)) {
            const a = prev.v - threshold;
            const b = cur.v - threshold;

            if (a === 0 || b === 0 || (a < 0 && b > 0) || (a > 0 && b < 0)) {
                if (a !== 0 && b !== 0) {
                    const ratio = (threshold - prev.v) / (cur.v - prev.v);
                    const tsCross = prev.ts + ratio * (cur.ts - prev.ts);

                    out.push({
                        ts: tsCross,
                        v: threshold,
                        below: threshold,
                        above: threshold,
                    });
                }
            }
        }

        const v = Number(cur.v);
        out.push({
            ...cur,
            below: v <= threshold ? v : null,
            above: v > threshold ? v : null,
        });
    }

    return out;
}

const DISPLAY_POINT_COUNT = 7;

function downsampleLastByBins(series, dayStart, dayEnd, bins = DISPLAY_POINT_COUNT) {
    if (!Array.isArray(series) || !Number.isFinite(dayStart) || !Number.isFinite(dayEnd)) return [];

    const endExclusive = dayEnd + 1;
    const step = (endExclusive - dayStart) / bins;

    const sorted = [...series]
        .filter((p) => Number.isFinite(p?.ts))
        .sort((a, b) => a.ts - b.ts);

    let idx = 0;
    let last = null;
    const out = [];

    for (let i = 0; i < bins; i++) {
        const binEndExclusive = dayStart + (i + 1) * step;

        // majuin pointer sampai batas bin (carry forward pembacaan terakhir)
        while (idx < sorted.length && sorted[idx].ts < binEndExclusive) {
            const v = Number(sorted[idx]?.v);
            last = Number.isFinite(v) ? { ts: sorted[idx].ts, v } : last;
            idx++;
        }

        const tsRaw = Math.min(dayStart + i * step, dayEnd);
        const dLabel = new Date(tsRaw);
        dLabel.setSeconds(0, 0);
        const tsLabel = dLabel.getTime();

        out.push({
            ts: tsLabel,
            v: last ? last.v : null,
            srcTs: last ? last.ts : null,
        });
    }

    return out;
}

function buildBelowAboveSeries(series, threshold) {
    return (Array.isArray(series) ? series : []).map((p) => {
        const v = Number(p?.v);
        const vv = Number.isFinite(v) ? v : null;
        return {
            ...p,
            v: vv,
            below: vv != null && vv <= threshold ? vv : null,
            above: vv != null && vv > threshold ? vv : null,
        };
    });
}



{/*Ubah ke False jika ingin matikan Data Dummy*/ }
const USE_DUMMY = false;

const BACKEND_LOC_NAME = {
    "right-arm": "right arm",
    "left-arm": "left arm",
    "right-leg": "right leg",
    "left-leg": "left leg",
    "back": "back",
};

const DUMMY_TYPES = ["humidity", "vibration", "pressure"];

const DUMMY_VALUE = {
    humidity: { base: 35, amp: 4.5, period: 18, noise: 0.25, spike: 2.5 },
    vibration: { base: 2.0, amp: 1.6, period: 14, noise: 0.08, spike: 0.6 },
    pressure: { base: 110, amp: 22, period: 22, noise: 1.0, spike: 6 },
};

function createDummyState() {
    const start = Date.now();
    const stepMs = 3000;
    const historyLen = 40;

    const sensors = [];

    PARTS.forEach((part) => {
        const count = PART_SENSOR_COUNT[part] ?? 2;
        for (let sid = 1; sid <= count; sid++) {
            DUMMY_TYPES.forEach((type) => {
                sensors.push({
                    type,
                    part,
                    locName: BACKEND_LOC_NAME[part],
                    externalId: sid,
                    phase: Math.random() * Math.PI * 2,
                    history: [],
                });
            });
        }
    });

    sensors.forEach((s) => {
        for (let i = historyLen - 1; i >= 0; i--) {
            const ts = start - i * stepMs;
            const v = dummyValueAt(s, ts, start);
            s.history.push({ ts, v });
        }
    });

    return { start, stepMs, historyLen, sensors };
}

function dummyValueAt(sensor, ts, start) {
    const cfg = DUMMY_VALUE[sensor.type] ?? DUMMY_VALUE.humidity;
    const t = (ts - start) / 1000;
    const noise = (Math.random() * 2 - 1) * cfg.noise;
    let v = cfg.base + cfg.amp * Math.sin(t / cfg.period + sensor.phase) + noise;

    if (Math.random() < 0.06) v += cfg.spike;

    return Math.round(v * 100) / 100;
}

function generateDummyReadings(state) {
    const now = Date.now();

    state.sensors.forEach((s) => {
        const v = dummyValueAt(s, now, state.start);
        s.history.push({ ts: now, v });
        while (s.history.length > state.historyLen) s.history.shift();
    });
    const readings = [];
    state.sensors.forEach((s) => {
        s.history.forEach((p) => {
            readings.push({
                timestamp: new Date(p.ts).toISOString(),
                value: p.v,
                sensor: {
                    location: { name: s.locName },
                    sensorType: { name: s.type },
                    externalId: s.externalId,
                },
            });
        });
    });

    return readings;
}

export default function DetailPage() {
    const dummyRef = useRef(null);
    const chartScrollRef = useRef(null);
    const { sensorKey } = useParams();
    const meta = SENSOR_META[sensorKey] ?? SENSOR_META.temp;
    const { Icon } = meta;

    const [activePart, setActivePart] = useState("back");
    const [activeSensorId, setActiveSensorId] = useState(1);
    const [sensorData, setSensorData] = useState({});
    const [loading, setLoading] = useState(true);
    const [chartContainerW, setChartContainerW] = useState(0);

    // Manual Y-axis bounds (kosongkan untuk auto)
    const [yMinInput, setYMinInput] = useState("");
    const [yMaxInput, setYMaxInput] = useState("");

    // ukur lebar container chart supaya kita bisa bikin chart lebih lebar + tetap responsif
    useEffect(() => {
        const el = chartScrollRef.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            const w = entries?.[0]?.contentRect?.width;
            if (Number.isFinite(w)) setChartContainerW(w);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        setActiveSensorId(1);
    }, [activePart]);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api-ss.stas-rg.com";

        const initShape = () => {
            const data = {};
            PARTS.forEach((part) => {
                const count = PART_SENSOR_COUNT[part] ?? 2;
                const series = {};
                const current = {};
                for (let i = 1; i <= count; i++) {
                    series[i] = [];
                    current[i] = 0;
                }
                data[part] = { series, current };
            });
            return data;
        };

        const normalizeLocation = (locName) => {
            const key = String(locName || "").trim().toLowerCase();
            return LOCATION_MAP_BACKEND[key] || null;
        };

        const resolveFrontendType = (backendType) => {
            const hit = Object.keys(SENSOR_META).find(
                (k) => SENSOR_META[k].backendType === backendType
            );
            return hit || sensorKey;
        };

        const resolveSensorNum = (externalId) => {
            const n = Number(externalId);
            if (Number.isFinite(n)) return n;

            const s = String(externalId || "");
            const m = s.match(/(\d+)/);
            if (m?.[1]) return Number(m[1]);

            return null;
        };

        const fetchData = async () => {
            try {
                let readings = [];

                if (USE_DUMMY) {
                    if (!dummyRef.current) dummyRef.current = createDummyState();
                    readings = generateDummyReadings(dummyRef.current);
                } else {
                    const res = await fetch(`${API_BASE}/sensor-reading`);
                    if (!res.ok) throw new Error("Gagal ambil data");
                    readings = await res.json();
                }

                const data = initShape();

                readings.forEach((r) => {
                    const backendLoc = r?.sensor?.location?.name;
                    const frontendLoc = normalizeLocation(backendLoc);

                    const backendType = r?.sensor?.sensorType?.name;
                    const frontendType = resolveFrontendType(backendType);

                    const sensorNum = resolveSensorNum(r?.sensor?.externalId);
                    const value = r?.value != null ? Number(r.value) : null;

                    if (!frontendLoc) return;
                    if (frontendType !== sensorKey) return;
                    if (!Number.isFinite(sensorNum)) return;
                    if (value == null || !Number.isFinite(value)) return;
                    if (!data[frontendLoc]?.series?.[sensorNum]) return;

                    const ts = new Date(r.timestamp).getTime();
                    data[frontendLoc].series[sensorNum].push({ ts, v: value });
                    data[frontendLoc].current[sensorNum] = value;
                });

                setSensorData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching:", err);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [sensorKey]);


    const sensorCount = PART_SENSOR_COUNT[activePart] ?? 2;

    const activeBlock = sensorData[activePart] || { series: {}, current: {} };

    useEffect(() => {
        if (activeSensorId > sensorCount) setActiveSensorId(1);
    }, [sensorCount, activeSensorId]);

    const chartSeries = activeBlock.series?.[activeSensorId] || [];
    const currentValue = activeBlock.current?.[activeSensorId] ?? 0;
    const threshold = meta.limit ?? 0;

    const { displaySeries, xDomain, displayTicks } = useMemo(() => {
        const latestTs = chartSeries.reduce(
            (mx, p) => (Number.isFinite(p?.ts) ? Math.max(mx, p.ts) : mx),
            0
        );

        const baseTs = latestTs || Date.now();
        const dayStart = startOfDayLocal(baseTs);
        const dayEnd = dayStart + MS_24H - 1;

        // Tetap baca semua data 24 jam, tapi chart hanya tampilkan 7 titik (pembacaan terakhir per rentang waktu)
        const raw24h = chartSeries
            .filter((p) => Number.isFinite(p?.ts) && p.ts >= dayStart && p.ts <= dayEnd)
            .map((p) => ({ ts: p.ts, v: Number(p?.v) }));

        const sampled = downsampleLastByBins(raw24h, dayStart, dayEnd, DISPLAY_POINT_COUNT);
        const colored = buildBelowAboveSeries(sampled, threshold);

        return {
            displaySeries: colored,
            xDomain: [dayStart, dayEnd],
            displayTicks: sampled.map((p) => p.ts),
        };
    }, [chartSeries, threshold]);


    const chartWidth = useMemo(() => {
        const containerW = Number(chartContainerW) || 0;
        // Tidak ada horizontal scroll: chart selalu mengikuti lebar container
        return containerW > 0 ? containerW : 640;
    }, [chartContainerW]);

    const yDomain = useMemo(() => {
        const vals = displaySeries
            .map((p) => Number(p?.v))
            .filter((v) => Number.isFinite(v));

        const minV = vals.length ? Math.min(...vals) : 0;
        const maxV = vals.length ? Math.max(...vals) : 1;

        const span = Math.max(1e-6, maxV - minV);
        const pad = span * 0.12;

        const softMin = Math.min(minV - pad, threshold * 0.85);
        const softMax = Math.max(maxV + pad, threshold * 1.15);

        const d0 = Number.isFinite(softMin) ? softMin : 0;
        const d1 = Number.isFinite(softMax) ? softMax : 1;

        if (d0 === d1) return [d0 - 1, d1 + 1];
        return [d0, d1];
    }, [displaySeries, threshold]);

    const finalYDomain = useMemo(() => {
        const autoMin = yDomain?.[0] ?? 0;
        const autoMax = yDomain?.[1] ?? 1;

        const minParsed = yMinInput.trim() === "" ? null : Number(yMinInput);
        const maxParsed = yMaxInput.trim() === "" ? null : Number(yMaxInput);

        let d0 = Number.isFinite(minParsed) ? minParsed : autoMin;
        let d1 = Number.isFinite(maxParsed) ? maxParsed : autoMax;

        if (d0 === d1) { d0 -= 1; d1 += 1; }
        if (d0 > d1) [d0, d1] = [d1, d0];

        return [d0, d1];
    }, [yMinInput, yMaxInput, yDomain]);

    return (
        <div className="min-h-dvh bg-[#e9eef3] p-3 sm:p-6 overflow-x-hidden">
            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-4 sm:gap-6 min-h-dvh">
                {/* HEADER */}
                <div className="neo-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <Link to="/dashboard" className="inline-flex items-center gap-2 hover:underline">
                                <ChevronLeft size={16} />
                                Dashboard
                            </Link>
                            <span className="text-slate-400">/</span>
                            <span className="truncate">{meta.label}</span>
                        </div>

                        <div className="text-xl font-semibold text-slate-800 mt-1 flex items-center gap-2">
                            <span className="neo-inset p-2 inline-flex items-center justify-center">
                                <Icon size={18} className="text-emerald-600" />
                            </span>
                            {meta.label} – Location Detail
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <NeoButton>Last 1h</NeoButton>
                        <StatusBadge tone="ok">ACTIVE</StatusBadge>
                    </div>
                </div>

                {/* MAIN AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0">
                    {/* LEFT: mannequin */}
                    <section className="lg:col-span-4 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="text-[12px] text-slate-500 mb-3 text-center">
                            Klik mannequin / kartu lokasi untuk fokus grafik. Pilih tab sensor untuk melihat sensor tertentu.
                        </div>

                        <div className="neo-inset p-3 flex-1 min-h-80 sm:min-h-0 flex items-center justify-center overflow-hidden">
                            <div className="relative h-full max-h-full aspect-2/3">
                                <MannequinHotspotSVG
                                    className="absolute inset-0 w-full h-full"
                                    activePart={activePart}
                                    onClickPart={setActivePart}
                                    onHoverPart={() => { }}
                                    onLeavePart={() => { }}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="text-sm text-slate-600 flex items-center gap-2">
                                <MapPin size={16} className="text-emerald-600" />
                                Focus:{" "}
                                <span className="font-semibold text-slate-900">{PART_LABEL[activePart]}</span>
                            </div>

                            <div className="text-sm text-slate-600">
                                {loading ? "Loading..." : (
                                    <>
                                        S{activeSensorId}: {fmt(currentValue)} {meta.unit}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: chart + sensor navigation */}
                    <section className="lg:col-span-8 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Grafik – {PART_LABEL[activePart]}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Punggung: 4 sensor • Tangan/Kaki: 2 sensor
                                </div>
                            </div>

                            <div className="text-sm text-slate-600">
                                {meta.label} ({meta.unit})
                            </div>
                        </div>

                        {/* Tabs sensor */}
                        <div className="mt-4">
                            <SensorTabs
                                count={sensorCount}
                                activeId={activeSensorId}
                                onChange={setActiveSensorId}
                            />
                        </div>

                        {/* Chart */}
                        <div className="neo-inset p-4 mt-4 flex-1 min-h-[280px] sm:min-h-0">
                            <div className="font-semibold text-slate-800 mb-2">
                                Sensor {activeSensorId} – {meta.label} ({meta.unit})
                            </div>

                            {/* X dibuat lebih lebar dan bisa di-scroll horizontal */}
                            <div ref={chartScrollRef} className="w-full h-[320px] overflow-y-hidden">
                                <div style={{ width: chartWidth, height: "320px" }}>
                                    <LineChart width={chartWidth} height={320} data={displaySeries} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
                                        <CartesianGrid strokeOpacity={0.15} />
                                        <XAxis
                                            dataKey="ts"
                                            type="number"
                                            scale="time"
                                            domain={xDomain}
                                            ticks={displayTicks}
                                            interval={0}
                                            tickLine={true}
                                            height={40}
                                            tick={<SimpleTimeTick />}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} domain={yDomain} allowDataOverflow />

                                        <Tooltip
                                            labelFormatter={(ts, payload) => {
                                                const p0 = payload?.[0]?.payload;
                                                const realTs = Number.isFinite(p0?.srcTs) ? p0.srcTs : ts;
                                                return new Date(realTs).toLocaleString("id-ID", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: false,
                                                });
                                            }}
                                            formatter={(value) => [fmt(value), `${meta.label} (${meta.unit})`]}
                                        />

                                        <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="6 4">
                                            <Label
                                                value={`Warning: ${threshold} ${meta.unit}`}
                                                position="insideLeft"
                                                dx={8}
                                                dy={-8}
                                                fill="#ef4444"
                                                fontSize={10}
                                            />
                                        </ReferenceLine>

                                        <Line
                                            type="monotone"
                                            dataKey="below"
                                            strokeWidth={2}
                                            stroke={SENSOR_COLOR[activeSensorId] || "#10b981"}
                                            dot={<DotWithValue />}
                                            connectNulls={false}
                                            isAnimationActive={false}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="above"
                                            strokeWidth={2}
                                            stroke="#ef4444"
                                            dot={<DotWithValue />}
                                            connectNulls={false}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* LOCATION BAR */}
                <div className="neo-surface p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        {PARTS.map((id) => (
                            <div key={id} className="self-stretch">
                                <LocationPill
                                    label={PART_LABEL[id]}
                                    currentObj={sensorData[id]?.current || {}}
                                    unit={meta.unit}
                                    count={PART_SENSOR_COUNT[id] ?? 2}
                                    active={activePart === id}
                                    threshold={threshold}
                                    onClick={() => setActivePart(id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
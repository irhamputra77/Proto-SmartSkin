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

const SENSOR_META = {
    temp: { label: "Temperature", unit: "°C", Icon: Thermometer, backendType: "temperature", limit: 26, yRange: [0, 80] },
    vib: { label: "Vibration", unit: "g", Icon: Waves, backendType: "vibration", limit: 3, yRange: [0, 3.3] },
    press: { label: "Pressure", unit: "kPa", Icon: Gauge, backendType: "pressure", limit: 18, yRange: [0, 20] },
};

const PART_LABEL = {
    "right-arm": "Right Hand",
    "left-arm": "Left Hand",
    "right-leg": "Right Leg",
    "left-leg": "Left Leg",
    back: "Back",
};

const PARTS = ["left-arm", "right-arm", "left-leg", "right-leg", "back"];

const PART_SENSOR_COUNT = {
    "left-arm": 2,
    "right-arm": 2,
    "left-leg": 3,
    "right-leg": 3,
    back: 4,
};

const LOCATION_MAP_BACKEND = {
    "right arm": "right-arm",
    "left arm": "left-arm",
    "right leg": "right-leg",
    "left leg": "left-leg",
    back: "back",
};

const SENSOR_COLOR = {
    1: "#10b981",
    2: "#3b82f6",
    3: "#f59e0b",
    4: "#10b981",
};

function fmt(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0";
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function fmtHHmmss(ts) {
    if (!Number.isFinite(ts)) return "";
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}

function fmtHHmm(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
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
                {fmtHHmmss(ts)}
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
                "active:translate-y-px active:scale-[0.99]",
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
                    "grid-cols-2",
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

const DISPLAY_POINT_COUNT = 7;

function takeLastNReadings(series, n = DISPLAY_POINT_COUNT) {
    if (!Array.isArray(series) || series.length === 0) return [];

    const sorted = [...series]
        .filter((p) => Number.isFinite(p?.ts))
        .sort((a, b) => a.ts - b.ts);

    const out = [];
    for (let i = sorted.length - 1; i >= 0 && out.length < n; i--) {
        const v = Number(sorted[i]?.v);
        if (!Number.isFinite(v)) continue;
        out.push({ ts: sorted[i].ts, v });
    }

    return out.reverse();
}

const USE_DUMMY = false;

const BACKEND_LOC_NAME = {
    "right-arm": "right arm",
    "left-arm": "left arm",
    "right-leg": "right leg",
    "left-leg": "left leg",
    "back": "back",
};

const DUMMY_TYPES = ["temperature", "vibration", "pressure"];

const DUMMY_VALUE = {
    temperature: { base: 35, amp: 4.5, period: 18, noise: 0.25, spike: 2.5 },
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
    const cfg = DUMMY_VALUE[sensor.type] ?? DUMMY_VALUE.temperature;
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
                const currentTs = {};
                for (let i = 1; i <= count; i++) {
                    series[i] = [];
                    current[i] = null;
                    currentTs[i] = -Infinity;
                }
                data[part] = { series, current, currentTs };
            });
            return data;
        };

        const normalizeLocation = (locName) => {
            const key = String(locName || "").trim().toLowerCase();
            return LOCATION_MAP_BACKEND[key] || null;
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
                    const url = new URL(`${API_BASE}/sensor-reading/paginated`);
                    url.searchParams.set("sensorType", meta.backendType);
                    url.searchParams.set("page", "1");
                    url.searchParams.set("limit", "300");

                    const res = await fetch(url.toString());
                    if (!res.ok) throw new Error("Failed to fetch data");

                    const json = await res.json();
                    readings = Array.isArray(json?.data) ? json.data : [];
                }

                const data = initShape();

                readings.forEach((r) => {
                    const backendLoc = r?.sensor?.location?.name;
                    const frontendLoc = normalizeLocation(backendLoc);

                    const backendType = r?.sensor?.sensorType?.name;
                    const sensorNum = resolveSensorNum(r?.sensor?.externalId);
                    const value = r?.value != null ? Number(r.value) : null;

                    if (!frontendLoc) return;
                    if (backendType !== meta.backendType) return;
                    if (!Number.isFinite(sensorNum)) return;
                    if (value == null || !Number.isFinite(value)) return;
                    if (!data[frontendLoc]?.series?.[sensorNum]) return;

                    const ts = new Date(r.timestamp).getTime();
                    if (!Number.isFinite(ts)) return;

                    data[frontendLoc].series[sensorNum].push({ ts, v: value });

                    const prevTs = data[frontendLoc].currentTs?.[sensorNum] ?? -Infinity;
                    if (ts >= prevTs) {
                        data[frontendLoc].currentTs[sensorNum] = ts;
                        data[frontendLoc].current[sensorNum] = value;
                    }
                });

                PARTS.forEach((part) => {
                    const count = PART_SENSOR_COUNT[part] ?? 2;
                    for (let i = 1; i <= count; i++) {
                        if (Array.isArray(data[part]?.series?.[i])) {
                            data[part].series[i].sort((a, b) => a.ts - b.ts);
                        }
                    }
                });

                setSensorData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [sensorKey, meta.backendType]);

    const sensorCount = PART_SENSOR_COUNT[activePart] ?? 2;
    const activeBlock = sensorData[activePart] || { series: {}, current: {} };

    useEffect(() => {
        if (activeSensorId > sensorCount) setActiveSensorId(1);
    }, [sensorCount, activeSensorId]);

    const chartSeries = activeBlock.series?.[activeSensorId] || [];
    const currentValue = activeBlock.current?.[activeSensorId] ?? 0;
    const threshold = meta.limit ?? 0;

    const { displaySeries, xDomain, displayTicks, tickPoints } = useMemo(() => {
        const lastN = takeLastNReadings(chartSeries, DISPLAY_POINT_COUNT);

        const ordered = [...lastN].sort((a, b) => a.ts - b.ts);

        const base = ordered.map((p, i) => ({
            x: i,
            v: p.v,
            srcTs: p.ts,
        }));

        const colored = buildThresholdSeriesByX(base, threshold);

        return {
            displaySeries: colored,
            xDomain: [0, Math.max(0, base.length - 1)],
            displayTicks: base.map((p) => p.x),
            tickPoints: base,
        };
    }, [chartSeries, threshold]);

    function buildThresholdSeriesByX(series, threshold) {
        const out = [];
        if (!Array.isArray(series) || series.length === 0) return out;

        const sorted = [...series]
            .filter((p) => Number.isFinite(p?.x))
            .sort((a, b) => a.x - b.x);

        for (let i = 0; i < sorted.length; i++) {
            const cur = sorted[i];
            const prev = sorted[i - 1];

            const curV = Number(cur?.v);
            const prevV = Number(prev?.v);

            const curOk = Number.isFinite(curV);
            const prevOk = Number.isFinite(prevV);

            if (prev && prevOk && curOk) {
                const a = prevV - threshold;
                const b = curV - threshold;

                const crosses =
                    a === 0 || b === 0 || (a < 0 && b > 0) || (a > 0 && b < 0);

                if (crosses && a !== 0 && b !== 0 && cur.x !== prev.x) {
                    const ratio = (threshold - prevV) / (curV - prevV);
                    const xCross = prev.x + ratio * (cur.x - prev.x);

                    out.push({
                        x: xCross,
                        v: threshold,
                        below: threshold,
                        above: threshold,
                        isCross: true,
                        srcTs:
                            Number.isFinite(prev?.srcTs) && Number.isFinite(cur?.srcTs)
                                ? prev.srcTs + ratio * (cur.srcTs - prev.srcTs)
                                : cur?.srcTs ?? prev?.srcTs ?? null,
                    });
                }
            }

            const vv = curOk ? curV : null;

            out.push({
                ...cur,
                v: vv,
                below: vv != null && vv <= threshold ? vv : null,
                above: vv != null && vv > threshold ? vv : null,
                isCross: false,
            });
        }

        return out;
    }

    const chartWidth = useMemo(() => {
        const containerW = Number(chartContainerW) || 0;
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
        const yr = meta?.yRange;
        if (Array.isArray(yr) && yr.length === 2) {
            const a = Number(yr[0]);
            const b = Number(yr[1]);
            if (Number.isFinite(a) && Number.isFinite(b)) {
                return a <= b ? [a, b] : [b, a];
            }
        }
        return yDomain;
    }, [meta, yDomain]);

    return (
        <div className="min-h-dvh bg-[#e9eef3] p-3 sm:p-6 overflow-x-hidden">
            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-4 sm:gap-6 min-h-dvh">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0">
                    <section className="lg:col-span-4 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="text-[12px] text-slate-500 mb-3 text-center">
                            Click mannequin / location card to focus the graph. Select sensor tab to view specific sensor.
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

                    <section className="lg:col-span-8 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Graph – {PART_LABEL[activePart]}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Back: 4 sensors • Hands: 2 sensors • Legs: 3 sensors
                                </div>
                            </div>

                            <div className="text-sm text-slate-600">
                                {meta.label} ({meta.unit})
                            </div>
                        </div>

                        <div className="mt-4">
                            <SensorTabs
                                count={sensorCount}
                                activeId={activeSensorId}
                                onChange={setActiveSensorId}
                            />
                        </div>

                        <div className="neo-inset p-4 mt-4 flex-1 min-h-[280px] sm:min-h-0">
                            <div className="font-semibold text-slate-800 mb-2">
                                Sensor {activeSensorId} – {meta.label} ({meta.unit})
                            </div>

                            <div ref={chartScrollRef} className="w-full h-[320px] overflow-y-hidden">
                                <div style={{ width: chartWidth, height: "320px" }}>
                                    <LineChart width={chartWidth} height={320} data={displaySeries} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
                                        <CartesianGrid strokeOpacity={0.15} />
                                        <XAxis
                                            dataKey="x"
                                            type="number"
                                            domain={xDomain}
                                            ticks={displayTicks}
                                            interval={0}
                                            tickLine={true}
                                            height={40}
                                            tick={({ x, y, payload }) => {
                                                const idx = payload?.value;
                                                const ts = tickPoints?.[idx]?.srcTs;
                                                return <SimpleTimeTick x={x} y={y} payload={{ value: ts }} />;
                                            }}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} domain={finalYDomain} allowDataOverflow />

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
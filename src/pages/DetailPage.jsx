import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import MannequinHotspotSVG from "../components/MannequinSVG";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { ChevronLeft, Thermometer, Waves, Gauge, MapPin } from "lucide-react";

const SENSOR_META = {
    temp: { label: "Temperature", unit: "°C", Icon: Thermometer, backendType: "humidity" },
    vib: { label: "Vibration", unit: "A", Icon: Waves, backendType: "vibration" },
    press: { label: "Pressure", unit: "N", Icon: Gauge, backendType: "pressure" },
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
    4: "#ef4444", // red
};

function fmt(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0";
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
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

function LocationPill({ label, currentObj, unit, count, active, onClick }) {
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
                    count === 4
                        ? "grid gap-2 grid-cols-4"
                        : "grid gap-2 grid-cols-2",
                    "min-h-11"
                ].join(" ")}
            >

                {Array.from({ length: count }, (_, i) => i + 1).map((sid) => (
                    <div
                        key={sid}
                        className={[
                            "neo-inset rounded-xl w-full flex items-center justify-between",
                            "h-10",
                            count === 4 ? "px-2" : "px-3"
                        ].join(" ")}
                    >
                        <div className={count === 4 ? "text-[10px] text-slate-500 font-medium" : "text-[11px] text-slate-500 font-medium"}>
                            S{sid}
                        </div>

                        <div className={count === 4 ? "text-sm font-semibold text-slate-900 whitespace-nowrap" : "text-base font-semibold text-slate-900 whitespace-nowrap"}>
                            {fmt(currentObj?.[sid] ?? 0)} {unit}
                        </div>
                    </div>
                ))}
            </div>



            <div className="mt-2 text-xs text-slate-500">{active ? "Selected" : "Tap to focus"}</div>
        </button>
    );
}

export default function DetailPage() {
    const { sensorKey } = useParams();
    const meta = SENSOR_META[sensorKey] ?? SENSOR_META.temp;
    const { Icon } = meta;

    const [activePart, setActivePart] = useState("back");
    const [activeSensorId, setActiveSensorId] = useState(1);
    const [sensorData, setSensorData] = useState({});
    const [loading, setLoading] = useState(true);

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
                const res = await fetch(`${API_BASE}/sensor-reading`);
                if (!res.ok) throw new Error("Gagal ambil data");
                const readings = await res.json();

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

                    // PERBAIKAN: Pastikan sensorNum tidak melebihi batas
                    const maxSensors = PART_SENSOR_COUNT[frontendLoc] || 2;
                    if (sensorNum < 1 || sensorNum > maxSensors) return;

                    if (!data[frontendLoc]?.series?.[sensorNum]) return;

                    data[frontendLoc].series[sensorNum].push({
                        time: new Date(r.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        v: value,
                    });
                    data[frontendLoc].current[sensorNum] = value;
                });

                setSensorData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching ", err);
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

                            <div className="flex-1 min-h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartSeries}>
                                        <CartesianGrid strokeOpacity={0.15} />
                                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="v"
                                            strokeWidth={2}
                                            stroke={SENSOR_COLOR[activeSensorId] || "#10b981"}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>
                </div>

                {/* LOCATION BAR */}
                <div className="neo-surface p-3 sm:p-4">
                    <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                        {PARTS.map((id) => (
                            <div key={id} className="min-w-60 sm:min-w-[320px] snap-start self-stretch">
                                <LocationPill
                                    label={PART_LABEL[id]}
                                    currentObj={sensorData[id]?.current || {}}
                                    unit={meta.unit}
                                    count={PART_SENSOR_COUNT[id] ?? 2}
                                    active={activePart === id}
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
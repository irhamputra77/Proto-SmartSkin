import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { Thermometer, Waves, Gauge, ChevronRight } from "lucide-react";

const SENSOR_TYPES = [
    {
        key: "temp",
        label: "Temperature",
        unit: "°C",
        Icon: Thermometer,
        desc: "Thermal load monitoring",
        sensorName: "Temperature Sensor",
        backendType: "temperature",
    },
    {
        key: "press",
        label: "Pressure",
        unit: "kPa",
        Icon: Gauge,
        desc: "Contact pressure distribution",
        sensorName: "Pressure Sensor",
        backendType: "pressure",
    },
    {
        key: "vib",
        label: "Vibration",
        unit: "g",
        Icon: Waves,
        desc: "Impact & vibration intensity",
        sensorName: "Vibration Sensor",
        backendType: "vibration",
    },
];

const PARTS = ["left-arm", "right-arm", "left-leg", "right-leg", "back"];

const PART_TO_BACKEND_LOCATION = {
    "right-arm": "right_arm",
    "left-arm": "left_arm",
    "right-leg": "right_leg",
    "left-leg": "left_leg",
    back: "back",
};

const FETCH_LIMIT_PER_PART = 21;

const EMPTY_SUMMARY = SENSOR_TYPES.reduce((acc, sensor) => {
    acc[sensor.key] = { min: 0, max: 0, avg: 0, status: "warn" };
    return acc;
}, {});

function fmt(v) {
    const value = Number(v);
    if (!Number.isFinite(value)) return "0";
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function toneLabel(tone) {
    if (tone === "warn") return "NO DATA";
    if (!tone) return "OK";
    return tone.toUpperCase();
}

function buildSummary(values) {
    if (values.length === 0) {
        return { min: 0, max: 0, avg: 0, status: "warn" };
    }

    return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((total, value) => total + value, 0) / values.length,
        status: "ok",
    };
}

function SensorTypeCard({ meta, summary, loading, onOpen }) {
    const { Icon } = meta;

    return (
        <button
            type="button"
            onClick={onOpen}
            className={[
                "neo-surface w-full text-left transition",
                "p-5 sm:p-6",
                "hover:scale-[1.01] active:scale-[0.995] active:translate-y-[1px]",
                "outline-none focus:ring-2 focus:ring-emerald-300/50 rounded-2xl",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="neo-inset p-2.5 rounded-2xl inline-flex items-center justify-center">
                        <Icon size={18} className="text-emerald-600" />
                    </span>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold text-slate-900 truncate">
                                {meta.label}
                            </div>
                            <span className="text-xs font-medium text-slate-500">({meta.unit})</span>
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                            Sensor:{" "}
                            <span className="font-medium text-slate-700">{meta.sensorName}</span>
                        </div>

                        <div className="text-sm text-slate-500 mt-1 truncate">{meta.desc}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge tone={summary?.status}>{toneLabel(summary?.status)}</StatusBadge>
                    <ChevronRight size={18} className="text-slate-400" />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 md:h-25 md:my-2">
                <div className="neo-inset p-3 rounded-2xl md:pt-6">
                    <div className="text-xs text-slate-500">Min</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                        {loading ? "..." : fmt(summary?.min)}{" "}
                        <span className="text-xs text-slate-500">{meta.unit}</span>
                    </div>
                </div>

                <div className="neo-inset p-3 rounded-2xl md:pt-6">
                    <div className="text-xs text-slate-500">Avg</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                        {loading ? "..." : fmt(summary?.avg)}{" "}
                        <span className="text-xs text-slate-500">{meta.unit}</span>
                    </div>
                </div>

                <div className="neo-inset p-3 rounded-2xl md:pt-6">
                    <div className="text-xs text-slate-500">Max</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                        {loading ? "..." : fmt(summary?.max)}{" "}
                        <span className="text-xs text-slate-500">{meta.unit}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                    {loading
                        ? "Loading latest data from all body locations..."
                        : <>Click to view <b>{meta.label}</b> details per body location.</>}
                </div>
            </div>
        </button>
    );
}

export default function DashboardPage() {
    const nav = useNavigate();
    const [summary, setSummary] = useState(EMPTY_SUMMARY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api-ss.stas-rg.com";
        let isCancelled = false;
        let isFetching = false;

        const fetchData = async () => {
            if (isFetching) return;
            isFetching = true;

            try {
                const requests = SENSOR_TYPES.flatMap((sensor) =>
                    PARTS.map(async (part) => {
                        const url = new URL(`${API_BASE}/sensor-reading/paginated`);
                        url.searchParams.set("sensorType", sensor.backendType);
                        url.searchParams.set("location", PART_TO_BACKEND_LOCATION[part]);
                        url.searchParams.set("page", "1");
                        url.searchParams.set("limit", String(FETCH_LIMIT_PER_PART));

                        const res = await fetch(url.toString(), {
                            cache: "no-store",
                        });

                        if (!res.ok) {
                            throw new Error(`Failed to fetch ${sensor.key} at ${part}`);
                        }

                        const json = await res.json();
                        return {
                            key: sensor.key,
                            readings: Array.isArray(json?.data) ? json.data : [],
                        };
                    })
                );

                const results = await Promise.allSettled(requests);

                if (isCancelled) return;

                const groupedValues = SENSOR_TYPES.reduce((acc, sensor) => {
                    acc[sensor.key] = [];
                    return acc;
                }, {});

                results.forEach((result) => {
                    if (result.status !== "fulfilled") return;

                    const { key, readings } = result.value;
                    readings.forEach((reading) => {
                        const value = reading?.value != null ? Number(reading.value) : null;
                        if (Number.isFinite(value)) {
                            groupedValues[key].push(value);
                        }
                    });
                });

                const nextSummary = SENSOR_TYPES.reduce((acc, sensor) => {
                    acc[sensor.key] = buildSummary(groupedValues[sensor.key]);
                    return acc;
                }, {});

                setSummary(nextSummary);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);

                if (!isCancelled) {
                    setSummary(EMPTY_SUMMARY);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
                isFetching = false;
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);

        return () => {
            isCancelled = true;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="min-h-[100dvh] bg-[#e9eef3] p-3 sm:p-6">
            <div className="w-full max-w-[1200px] mx-auto space-y-4 sm:space-y-6">
                <div className="neo-surface p-4 sm:p-6 rounded-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                                Smart Skin Dashboard
                            </div>
                            <div className="mt-1 text-sm text-slate-500 max-w-3xl">
                                Select <b>sensor type</b> to view trends and details per body location (mannequin).
                            </div>
                        </div>

                        <div className="neo-inset p-3 rounded-2xl shrink-0">
                            <img
                                src="/Logo.png"
                                alt="STAS RG"
                                className="h-10 sm:h-12 w-auto object-contain"
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-slate-900">Sensor Categories</div>
                        <div className="text-xs text-slate-500">
                            Tap card to go to detail page (per body part).
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:py-10 md:h-[400px]">
                    {SENSOR_TYPES.map((meta) => (
                        <SensorTypeCard
                            key={meta.key}
                            meta={meta}
                            summary={summary[meta.key]}
                            loading={loading}
                            onOpen={() => nav(`/sensor/${meta.key}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

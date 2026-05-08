import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { Thermometer, Waves, Gauge, ChevronRight, ArrowLeftRight, Activity } from "lucide-react";

const SENSOR_TYPES = [
    {
        key: "temp",
        label: "Temperature",
        unit: "°C",
        Icon: Thermometer,
        desc: "Thermal load monitoring",
        sensorName: "MCP9808",
        backendType: "temperature",
    },
    {
        key: "press",
        label: "Pressure",
        unit: "N",
        Icon: Gauge,
        desc: "Contact pressure distribution",
        sensorName: "FSR RP-S40-ST",
        backendType: "pressure",
    },
    {
        key: "vib",
        label: "Vibration",
        unit: "V",
        Icon: Waves,
        desc: "Impact & vibration intensity",
        sensorName: "Piezoelectric",
        backendType: "vibration",
    },
    {
        key: "flex",
        label: "Flex",
        unit: "Ω",
        Icon: ArrowLeftRight,
        desc: "Bend angle resistance (elbow & knee)",
        sensorName: "Flex Sensor",
        backendType: "flex",
    },
    {
        key: "strain",
        label: "Strain",
        unit: "µε",
        Icon: Activity,
        desc: "Structural deformation (elbow & knee)",
        sensorName: "Strain Gauge",
        backendType: "strain",
    },
];

const EMPTY_SUMMARY = SENSOR_TYPES.reduce((acc, sensor) => {
    acc[sensor.key] = { value: null, timestamp: null, status: "warn" };
    return acc;
}, {});

function fmt(v) {
    if (v === null || v === undefined) return "0";
    const value = Number(v);
    if (!Number.isFinite(value)) return "0";
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function toneLabel(tone) {
    if (tone === "warn") return "NO DATA";
    if (!tone) return "OK";
    return tone.toUpperCase();
}

function timeAgo(timestamp) {
    if (!timestamp) return "No data";
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    return then.toLocaleDateString();
}

function buildRealtimeSummary(latestData) {
    if (!latestData || latestData.value === null || latestData.value === undefined) {
        return { value: null, timestamp: null, status: "warn" };
    }

    return {
        value: Number(latestData.value),
        timestamp: latestData.timestamp,
        status: "ok",
    };
}

function SensorTypeCard({ meta, summary, loading, onOpen }) {
    const { Icon } = meta;
    const hasData = summary?.value !== null && summary?.value !== undefined;

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

            <div className="mt-4 neo-inset p-5 rounded-2xl">
                <div className="text-xs text-slate-500 mb-1">Latest Reading</div>
                <div className="text-4xl font-bold text-slate-900">
                    {loading ? "..." : hasData ? (
                        <>
                            {fmt(summary?.value)}{" "}
                            <span className="text-lg text-slate-500">{meta.unit}</span>
                        </>
                    ) : (
                        <>
                            --{" "}
                            <span className="text-lg text-slate-500">{meta.unit}</span>
                        </>
                    )}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    Updated: {loading ? "..." : timeAgo(summary?.timestamp)}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                    {loading
                        ? "Loading latest data..."
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
    const [mannequinId, setMannequinId] = useState(1);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api-ss.stas-rg.com";
        let isCancelled = false;
        let isFetching = false;

        const fetchData = async () => {
            if (isFetching) return;
            isFetching = true;

            try {
                const url = new URL(`${API_BASE}/sensor-reading/latest`);
                url.searchParams.set("mannequin_id", String(mannequinId));
                const res = await fetch(url.toString(), { cache: "no-store" });

                if (!res.ok) {
                    throw new Error("Failed to fetch latest readings");
                }

                const data = await res.json();

                if (isCancelled) return;

                // Map backend data to frontend summary
                const nextSummary = SENSOR_TYPES.reduce((acc, sensor) => {
                    const sensorData = data.find(
                        (item) => item.sensorType === sensor.backendType
                    );
                    acc[sensor.key] = buildRealtimeSummary(sensorData || { value: null, timestamp: null });
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
    }, [mannequinId]);

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

                        <div className="flex items-center gap-3 shrink-0">
                            <select
                                value={mannequinId}
                                onChange={(e) => {
                                    setMannequinId(Number(e.target.value));
                                    setSummary(EMPTY_SUMMARY);
                                    setLoading(true);
                                }}
                                className="neo-inset px-3 py-2 rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            >
                                <option value={1}>Mannequin 1</option>
                                <option value={2}>Mannequin 2</option>
                            </select>
                            <div className="neo-inset p-3 rounded-2xl">
                                <img
                                    src="/Logo.png"
                                    alt="STAS RG"
                                    className="h-10 sm:h-12 w-auto object-contain"
                                    draggable={false}
                                />
                            </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
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

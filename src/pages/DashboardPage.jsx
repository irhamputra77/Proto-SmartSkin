import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { Thermometer, Waves, Gauge, ChevronRight, Wifi, WifiOff } from "lucide-react";
import { useSensorWebSocket } from "../hooks/useSensorWebSocket";

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
    const { isConnected, latestData } = useSensorWebSocket();

    // Process WebSocket data into summary format
    useEffect(() => {
        const nextSummary = SENSOR_TYPES.reduce((acc, sensor) => {
            // Try to find data from websocket
            const keys = Object.keys(latestData);
            const sensorData = keys
                .filter((k) => k.startsWith(`${sensor.backendType}-`))
                .map((k) => latestData[k])
                .filter((d) => d?.value !== null && d?.value !== undefined)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            acc[sensor.key] = buildRealtimeSummary(sensorData);
            return acc;
        }, {});

        setSummary(nextSummary);
        if (loading) setLoading(false);
    }, [latestData]);

    // Fallback: fetch initial data via HTTP if WebSocket hasn't received data yet
    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api-ss.stas-rg.com";
        let isCancelled = false;

        const fetchInitial = async () => {
            try {
                const url = new URL(`${API_BASE}/sensor-reading/latest`);
                const res = await fetch(url.toString(), { cache: "no-store" });

                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status}`);
                }

                const data = await res.json();
                if (isCancelled) return;

                const nextSummary = SENSOR_TYPES.reduce((acc, sensor) => {
                    const sensorData = data.find(
                        (item) => item.sensorType === sensor.backendType
                    );
                    acc[sensor.key] = buildRealtimeSummary(sensorData || { value: null, timestamp: null });
                    return acc;
                }, {});

                setSummary(nextSummary);
            } catch (err) {
                console.error("Error fetching initial data:", err);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        fetchInitial();
        return () => { isCancelled = true; };
    }, []);

    return (
        <div className="min-h-[100dvh] bg-[#e9eef3] p-3 sm:p-6">
            <div className="w-full max-w-[1200px] mx-auto space-y-4 sm:space-y-6">
                <div className="neo-surface p-4 sm:p-6 rounded-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                                    Smart Skin Dashboard
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 neo-inset rounded-lg text-xs">
                                    {isConnected ? (
                                        <>
                                            <Wifi size={14} className="text-emerald-600" />
                                            <span className="text-emerald-600 font-medium">Live</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff size={14} className="text-orange-600" />
                                            <span className="text-orange-600 font-medium">Connecting...</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-1 text-sm text-slate-500 max-w-3xl">
                                Real-time sensor data via WebSocket. Select <b>sensor type</b> to view details.
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

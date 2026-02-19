import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { Thermometer, Waves, Gauge, ChevronRight } from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const SENSOR_TYPES = [
    {
        key: "temp",
        label: "Temperature",
        unit: "°C",
        Icon: Thermometer,
        desc: "Thermal load monitoring",
        sensorName: "Temperature Sensor",
        backendType: "humidity",
    },
    {
        key: "press",
        label: "Pressure",
        unit: "N",
        Icon: Gauge,
        desc: "Contact pressure distribution",
        sensorName: "Pressure Sensor",
        backendType: "pressure",
    },
    {
        key: "vib",
        label: "Vibration",
        unit: "A",
        Icon: Waves,
        desc: "Impact & vibration intensity",
        sensorName: "Vibration Sensor",
        backendType: "vibration",
    },
];

// Mapping lokasi
const LOCATION_MAP = {
    "right arm": "right-leg",
    "left arm": "left-leg",
    "right leg": "right-leg",
    "left leg": "left-leg",
    "back": "back",
};

export default function DashboardPage() {
    const nav = useNavigate();
    const [summary, setSummary] = useState({});
    const [overallData, setOverallData] = useState({
        temp: [],
        press: [],
        vib: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "localhost:3000";

        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/sensor-reading`);
                if (!res.ok) throw new Error('Gagal ambil data');
                const readings = await res.json();
                

                const sensorData = {
                    temp: [],
                    press: [],
                    vib: []
                };

                readings.forEach(r => {
                    const backendType = r.sensor.sensorType.name;
                    const sensorKey = Object.keys(SENSOR_TYPES).find(key =>
                        SENSOR_TYPES[key].backendType === backendType
                    );

                    if (sensorKey && r.value != null) {
                        sensorData[sensorKey].push(parseFloat(r.value));
                    }
                });

                const newSummary = {};
                for (const key of Object.keys(sensorData)) {
                    const values = sensorData[key];
                    if (values.length > 0) {
                        newSummary[key] = {
                            min: Math.min(...values),
                            max: Math.max(...values),
                            avg: values.reduce((a, b) => a + b, 0) / values.length,
                            status: "ok"
                        };
                    } else {
                        newSummary[key] = { min: 0, max: 0, avg: 0, status: "ok" };
                    }
                }


                const now = Date.now();
                const timeSeries = {};
                for (const key of Object.keys(sensorData)) {
                    timeSeries[key] = Array.from({ length: 60 }).map((_, i) => {
                        const t = new Date(now - (59 - i) * 60_000);
                        const avgVal = sensorData[key].length > 0
                            ? sensorData[key][i % sensorData[key].length]
                            : key === "temp" ? 28 + Math.sin(i / 6) * 1.1 :
                                key === "vib" ? 0.45 + Math.abs(Math.cos(i / 8)) * 0.75 :
                                    40 + Math.sin(i / 5) * 9;

                        return {
                            time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            v: avgVal
                        };
                    });
                }

                setSummary(newSummary);
                setOverallData(timeSeries);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setSummary({
                    temp: { avg: 28.2, min: 26.9, max: 30.1, status: "ok" },
                    vib: { avg: 0.62, min: 0.21, max: 1.02, status: "ok" },
                    press: { avg: 44, min: 28, max: 61, status: "ok" },
                });
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    function fmt(v) {
        if (typeof v !== "number") return "0";
        return Number.isInteger(v) ? String(v) : v.toFixed(2);
    }

    function toneLabel(tone) {
        if (!tone) return "OK";
        return tone.toUpperCase();
    }

    function SensorTypeCard({ meta, summary, onOpen }) {
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
                {/* header */}
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

                {/* body */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="neo-inset p-3 rounded-2xl">
                        <div className="text-xs text-slate-500">Min</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                            {fmt(summary?.min)}{" "}
                            <span className="text-xs text-slate-500">{meta.unit}</span>
                        </div>
                    </div>

                    <div className="neo-inset p-3 rounded-2xl">
                        <div className="text-xs text-slate-500">Avg</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                            {fmt(summary?.avg)}{" "}
                            <span className="text-xs text-slate-500">{meta.unit}</span>
                        </div>
                    </div>

                    <div className="neo-inset p-3 rounded-2xl">
                        <div className="text-xs text-slate-500">Max</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                            {fmt(summary?.max)}{" "}
                            <span className="text-xs text-slate-500">{meta.unit}</span>
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">
                        Klik untuk lihat detail <b>{meta.label}</b> per lokasi tubuh.
                    </div>
                </div>
            </button>
        );
    }

    function MiniTrend({ title, unit, data }) {
        return (
            <div className="neo-surface p-4 sm:p-5 rounded-2xl min-h-[240px]">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                    <div className="font-semibold text-slate-900">{title}</div>
                    <div className="text-xs text-slate-500">Unit: {unit}</div>
                </div>

                <div className="neo-inset p-3 h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeOpacity={0.15} />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={8} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="v" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                    Trend agregat (avg semua lokasi tubuh). Detail per bagian tubuh ada di halaman detail.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#e9eef3] p-3 sm:p-6">
            <div className="w-full max-w-[1200px] mx-auto space-y-4 sm:space-y-6">
                {/* HEADER */}
                <div className="neo-surface p-4 sm:p-6 rounded-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 truncate">
                                Smart Skin Dashboard
                            </div>
                            <div className="mt-1 text-sm text-slate-500 max-w-3xl">
                                Pilih <b>jenis sensor</b> untuk melihat tren dan detail per lokasi tubuh (mannequin).
                            </div>
                        </div>

                        {/* logo kanan */}
                        <div className="neo-inset p-3 rounded-2xl shrink-0">
                            <img
                                src="/public/logo stas rg baru besar.png"
                                alt="STAS RG"
                                className="h-10 sm:h-12 w-auto object-contain"
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION TITLE */}
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-slate-900">Sensor Categories</div>
                        <div className="text-xs text-slate-500">
                            Tap card untuk masuk ke halaman detail (per bagian tubuh).
                        </div>
                    </div>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {SENSOR_TYPES.map((meta) => (
                        <SensorTypeCard
                            key={meta.key}
                            meta={meta}
                            summary={summary[meta.key]}
                            onOpen={() => nav(`/sensor/${meta.key}`)}
                        />
                    ))}
                </div>

                {/* OVERALL TREND */}
                <div className="neo-surface p-4 sm:p-6 rounded-2xl">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Overall Trend</div>
                            <div className="text-xs text-slate-500 mt-1">
                                Grafik agregat (avg semua titik). Detail per bagian tubuh ada di halaman detail.
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">Window: 60 min</div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        <MiniTrend title="Temperature" unit="°C" data={overallData.temp} />
                        <MiniTrend title="Pressure" unit="N" data={overallData.press} />
                        <MiniTrend title="Vibration" unit="A" data={overallData.vib} />
                    </div>
                </div>
            </div>
        </div>
    );
}
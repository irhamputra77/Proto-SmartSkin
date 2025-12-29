import { useEffect, useMemo, useState } from "react";
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
    "right-leg": "Kaki Kanan",
    "left-leg": "Kaki Kiri",
    back: "Punggung",
};

const PARTS = ["left-arm", "right-arm", "left-leg", "right-leg", "back"];

// Mapping backend ke frontend
const LOCATION_MAP_BACKEND = {
    "right arm": "right-leg",
    "left arm": "left-leg",
    "right leg": "right-leg",
    "left leg": "left-leg",
    "back": "back",
};

export default function DetailPage() {
    const { sensorKey } = useParams();
    const meta = SENSOR_META[sensorKey] ?? SENSOR_META.temp;
    const { Icon } = meta;

    const [activePart, setActivePart] = useState("back");
    const [sensorData, setSensorData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/sensor-reading`);
                if (!res.ok) throw new Error('Gagal ambil data');
                const readings = await res.json();

                // Kelompokkan data per lokasi dan nomor sensor
                const data = {};
                PARTS.forEach(part => {
                    data[part] = {
                        sensor1: [],
                        sensor2: [],
                        current: { sensor1: 0, sensor2: 0 }
                    };
                });

                readings.forEach(r => {
                    const backendLoc = r.sensor.location.name;
                    const frontendLoc = LOCATION_MAP_BACKEND[backendLoc];
                    const backendType = r.sensor.sensorType.name;
                    const frontendType = Object.keys(SENSOR_META).find(key => 
                        SENSOR_META[key].backendType === backendType
                    );
                    
                    if (frontendLoc && frontendType === sensorKey && r.value != null) {
                        const sensorNum = r.sensor.externalId; // 1 atau 2
                        const value = parseFloat(r.value);
                        
                        if (sensorNum === 1) {
                            data[frontendLoc].sensor1.push({
                                time: new Date(r.timestamp).toLocaleTimeString([], { 
                                    hour: "2-digit", 
                                    minute: "2-digit" 
                                }),
                                v: value
                            });
                            data[frontendLoc].current.sensor1 = value;
                        } else if (sensorNum === 2) {
                            data[frontendLoc].sensor2.push({
                                time: new Date(r.timestamp).toLocaleTimeString([], { 
                                    hour: "2-digit", 
                                    minute: "2-digit" 
                                }),
                                v: value
                            });
                            data[frontendLoc].current.sensor2 = value;
                        }
                    }
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

    const currentData = sensorData[activePart] || { current: { sensor1: 0, sensor2: 0 } };
    const series1 = sensorData[activePart]?.sensor1 || [];
    const series2 = sensorData[activePart]?.sensor2 || [];

    function fmt(v) {
        if (typeof v !== "number") return "0";
        return Number.isInteger(v) ? String(v) : v.toFixed(2);
    }

    function LocationPill({ label, value1, value2, unit, active, onClick }) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-pressed={active}
                className={[
                    "w-full text-left rounded-2xl transition select-none",
                    active
                        ? "neo-inset"
                        : "neo-surface hover:scale-[1.01]",
                    "p-4",
                    active ? "ring-2 ring-emerald-400/60" : "focus:ring-2 focus:ring-emerald-300/50",
                    "active:translate-y-[1px] active:scale-[0.99]",
                    active ? "translate-y-[1px]" : "",
                ].join(" ")}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900">{label}</div>
                    <StatusBadge tone="ok" className="text-xs px-3 py-1">
                        OK
                    </StatusBadge>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                        <div className="text-xs text-slate-500">Sensor 1</div>
                        <div className="text-lg font-semibold text-slate-900">{fmt(value1)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Sensor 2</div>
                        <div className="text-lg font-semibold text-slate-900">{fmt(value2)}</div>
                    </div>
                </div>

                <div className="mt-1 text-xs text-slate-500">
                    {active ? "Selected" : "Tap to focus"}
                </div>
            </button>
        );
    }

    return (
        <div className="h-screen bg-[#e9eef3] p-4 sm:p-6 overflow-hidden">
            <div className="max-w-[1400px] mx-auto h-full flex flex-col gap-4 sm:gap-6">
                {/* HEADER */}
                <div className="neo-surface p-4 sm:p-5 flex items-center justify-between">
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

                        <div className="text-sm text-slate-500 mt-1">
                            Klik mannequin / kartu lokasi untuk fokus grafik (2 sensor per lokasi).
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NeoButton>Last 1h</NeoButton>
                        <StatusBadge tone="ok">5/5 ACTIVE</StatusBadge>
                    </div>
                </div>

                {/* MAIN AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0">
                    {/* LEFT: mannequin */}
                    <section className="lg:col-span-4 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="neo-inset p-3 flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                            <div className="relative h-full max-h-full aspect-[2/3]">
                                <MannequinHotspotSVG
                                    className="absolute inset-0 w-full h-full"
                                    activePart={activePart}
                                    onClickPart={setActivePart}
                                    onHoverPart={() => {}}
                                    onLeavePart={() => {}}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-slate-600 flex items-center gap-2">
                                <MapPin size={16} className="text-emerald-600" />
                                Focus:{" "}
                                <span className="font-semibold text-slate-900">{PART_LABEL[activePart]}</span>
                            </div>
                            <div className="text-sm text-slate-600">
                                S1: {fmt(currentData.current.sensor1)} {meta.unit} | 
                                S2: {fmt(currentData.current.sensor2)} {meta.unit}
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: charts (2 charts) */}
                    <section className="lg:col-span-8 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                            {/* Chart Sensor 1 */}
                            <div className="neo-inset p-4 flex flex-col min-h-0">
                                <div className="font-semibold text-slate-800 mb-2">
                                    Sensor 1 – {meta.label} ({meta.unit})
                                </div>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={series1}>
                                            <CartesianGrid strokeOpacity={0.15} />
                                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line 
                                                type="monotone" 
                                                dataKey="v" 
                                                strokeWidth={2} 
                                                stroke="#10b981"
                                                dot={false} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart Sensor 2 */}
                            <div className="neo-inset p-4 flex flex-col min-h-0">
                                <div className="font-semibold text-slate-800 mb-2">
                                    Sensor 2 – {meta.label} ({meta.unit})
                                </div>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={series2}>
                                            <CartesianGrid strokeOpacity={0.15} />
                                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line 
                                                type="monotone" 
                                                dataKey="v" 
                                                strokeWidth={2} 
                                                stroke="#3b82f6"
                                                dot={false} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* LOCATION BAR */}
                <div className="neo-surface p-3 sm:p-4">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {PARTS.map((id) => (
                            <div key={id} className="min-w-[260px] sm:min-w-[280px]">
                                <LocationPill
                                    label={PART_LABEL[id]}
                                    value1={sensorData[id]?.current?.sensor1 || 0}
                                    value2={sensorData[id]?.current?.sensor2 || 0}
                                    unit={meta.unit}
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
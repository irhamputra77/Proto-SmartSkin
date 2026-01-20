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
    "right-leg": "Paha Kanan",
    "left-leg": "Paha Kiri",
    back: "Punggung",
};

const PARTS = ["left-arm", "right-arm", "left-leg", "right-leg", "back"];

// Jumlah sensor per lokasi
const SENSOR_COUNT = {
  "right-arm": 2,
  "left-arm": 2,
  "right-leg": 3,
  "left-leg": 3,
  "back": 4,
};

// Mapping backend ke frontend
const LOCATION_MAP_BACKEND = {
    "right arm": "right-arm",
    "left arm": "left-arm",
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
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://api-ss.stas-rg.com";
        
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/sensor-reading`);
                if (!res.ok) throw new Error('Gagal ambil data');
                const readings = await res.json();

                // Inisialisasi data per lokasi
                const data = {};
                PARTS.forEach(part => {
                    const sensorCount = SENSOR_COUNT[part];
                    const sensors = {};
                    for (let i = 1; i <= sensorCount; i++) {
                      sensors[`sensor${i}`] = [];
                    }
                    data[part] = {
                      ...sensors,
                      current: {}
                    };
                    for (let i = 1; i <= sensorCount; i++) {
                      data[part].current[`sensor${i}`] = 0;
                    }
                });

                readings.forEach(r => {
                    const backendLoc = r.sensor.location.name;
                    const frontendLoc = LOCATION_MAP_BACKEND[backendLoc];
                    const backendType = r.sensor.sensorType.name;
                    const frontendType = Object.keys(SENSOR_META).find(key => 
                        SENSOR_META[key].backendType === backendType
                    );
                    
                    if (frontendLoc && frontendType === sensorKey && r.value != null) {
                        const sensorNum = r.sensor.externalId;
                        const value = parseFloat(r.value);
                        const timestamp = new Date(r.timestamp).getTime();
                        
                        const sensorKey = `sensor${sensorNum}`;
                        if (data[frontendLoc][sensorKey] !== undefined) {
                          data[frontendLoc][sensorKey].push({
                              time: new Date(r.timestamp).toLocaleTimeString([], { 
                                  hour: "2-digit", 
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: false
                              }),
                              v: value,
                              rawTime: timestamp
                          });
                          data[frontendLoc].current[sensorKey] = value;
                        }
                    }
                });

                // Urutkan data berdasarkan waktu
                for (const part of PARTS) {
                  const sensorCount = SENSOR_COUNT[part];
                  for (let i = 1; i <= sensorCount; i++) {
                    const key = `sensor${i}`;
                    if (data[part][key]?.length > 0) {
                      data[part][key].sort((a, b) => a.rawTime - b.rawTime);
                    }
                  }
                }

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

    const currentData = sensorData[activePart] || { current: {} };
    const sensorCount = SENSOR_COUNT[activePart] || 2;
    
    // Ambil series untuk setiap sensor (batasi 7 titik)
    const series = {};
    for (let i = 1; i <= sensorCount; i++) {
      series[`sensor${i}`] = sensorData[activePart]?.[`sensor${i}`]?.slice(-7) || [];
    }

    function fmt(v) {
        if (typeof v !== "number") return "0";
        return Number.isInteger(v) ? String(v) : v.toFixed(2);
    }

    function LocationPill({ label, currentData, unit, active, onClick }) {
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
                  {Object.keys(currentData).map((key, idx) => (
                    <div key={key}>
                      <div className="text-xs text-slate-500">Sensor {idx+1}</div>
                      <div className="text-lg font-semibold text-slate-900">
                        {fmt(currentData[key])}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                    {active ? "Selected" : "Tap to focus"}
                </div>
            </button>
        );
    }

    // Warna untuk setiap sensor
    const SENSOR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

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
                            Klik mannequin / kartu lokasi untuk fokus grafik.
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NeoButton>Last 1h</NeoButton>
                        <StatusBadge tone="ok">ACTIVE</StatusBadge>
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
                              {Object.entries(currentData.current).map(([key, value], idx) => (
                                <span key={key}>
                                  S{idx+1}: {fmt(value)} {meta.unit}{idx < Object.keys(currentData.current).length - 1 ? " | " : ""}
                                </span>
                              ))}
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: charts (dinamis) */}
                    <section className="lg:col-span-8 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className={`grid gap-4 flex-1 min-h-0 ${
                          sensorCount <= 2 ? "grid-cols-1 md:grid-cols-2" :
                          sensorCount === 3 ? "grid-cols-1 md:grid-cols-3" :
                          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                        }`}>
                          {Array.from({ length: sensorCount }).map((_, i) => {
                            const sensorNum = i + 1;
                            const seriesData = series[`sensor${sensorNum}`] || [];
                            return (
                              <div key={sensorNum} className="neo-inset p-4 flex flex-col min-h-0">
                                <div className="font-semibold text-slate-800 mb-2">
                                  Sensor {sensorNum} – {meta.label} ({meta.unit})
                                </div>
                                <div className="flex-1 min-h-0">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={seriesData}>
                                      <CartesianGrid strokeOpacity={0.15} />
                                      <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveEnd" />
                                      <YAxis tick={{ fontSize: 10 }} />
                                      <Tooltip />
                                      <Line 
                                        type="monotone" 
                                        dataKey="v" 
                                        strokeWidth={2} 
                                        stroke={SENSOR_COLORS[i % SENSOR_COLORS.length]}
                                        dot={false} 
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          })}
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
                                    currentData={sensorData[id]?.current || {}}
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
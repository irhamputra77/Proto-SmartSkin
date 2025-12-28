import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import SensorCard from "../components/SensorCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ChevronLeft,
  Activity,
  Thermometer,
  Waves,
  Grip,
  Gauge,
  StretchHorizontal,
  Clock,
  TriangleAlert,
} from "lucide-react";

// 🔁 MAP UI route ke nama lokasi di backend (exact match!)
const UI_PART_TO_BACKEND_LOCATION = {
  "left-arm": "left arm",
  "right-arm": "right arm",
  "left-leg": "left leg",
  "right-leg": "right leg",
  back: "back",
};

const PART_LABEL = {
  "right-arm": "Lengan Kanan",
  "left-arm": "Lengan Kiri",
  "right-leg": "Kaki Kanan",
  "left-leg": "Kaki Kiri",
  back: "Punggung",
};

const SENSORS = [
  { key: "temp", label: "Temperature", unit: "°C", Icon: Thermometer },
  { key: "vib", label: "Vibration", unit: "g", Icon: Waves },
  { key: "fric", label: "Friction", unit: "N", Icon: Grip },
  { key: "press", label: "Pressure", unit: "kPa", Icon: Gauge },
  { key: "str", label: "Stretch", unit: "mm", Icon: StretchHorizontal },
];

// 🔁 Mapping nama sensor_type.name (dari backend) ke key frontend
const SENSOR_TYPE_NAME_TO_KEY = {
  friction: "fric",
  vibration: "vib",
  humidity: "temp", // asumsi: humidity = MCP9808 = suhu
  pressure: "press",
  stretch: "str",
};

// ✅ Daftar semua key sensor untuk inisialisasi
const ALL_SENSOR_KEYS = SENSORS.map((s) => s.key);

export default function DetailPage() {
  const { part } = useParams();
  const label = PART_LABEL[part] ?? part;
  const backendLocationName = UI_PART_TO_BACKEND_LOCATION[part];

  const [active, setActive] = useState("press");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sensorMetadata, setSensorMetadata] = useState({});

  // Fetch metadata sensor
  useEffect(() => {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    const fetchSensorMeta = async () => {
      try {
        const res = await fetch(`${API_BASE}/sensor`);
        if (!res.ok) throw new Error("Gagal ambil metadata sensor");
        const sensors = await res.json();

        const meta = {};
        for (const sensor of sensors) {
          const key = SENSOR_TYPE_NAME_TO_KEY[sensor.sensorType?.name];
          if (key && sensor.location?.name) {
            meta[sensor.id] = {
              typeKey: key,
              locationName: sensor.location.name,
            };
          }
        }
        setSensorMetadata(meta);
      } catch (err) {
        console.error("Error fetching sensor metadata:", err);
        setError("Gagal muat metadata sensor");
      }
    };

    if (part) fetchSensorMeta();
  }, [part]);

  // Fetch readings
  useEffect(() => {
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    if (
      !part ||
      !backendLocationName ||
      Object.keys(sensorMetadata).length === 0
    )
      return;

    const fetchReadings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/sensor-reading`);
        if (!res.ok) throw new Error("Gagal ambil data sensor");
        const readings = await res.json();
        const relevantReadings = readings.filter((r) => {
          const meta = sensorMetadata[r.sensor?.id];
          return meta && meta.locationName === backendLocationName;
        });

        const dataPoints = relevantReadings
          .map((r) => {
            const meta = sensorMetadata[r.sensor?.id];
            if (!meta || r.value == null) return null;

            const date = new Date(r.timestamp);
            return {
              time: date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit", // Tambahkan detik untuk unik
                hour12: false,
              }),
              timestamp: date.getTime(),
              typeKey: meta.typeKey,
              value: parseFloat(r.value),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-50);

        // ✅ Inisialisasi semua kolom sensor di setiap titik waktu
        const timeGroups = {};
        for (const point of dataPoints) {
          if (!timeGroups[point.timestamp]) {
            const initialData = { time: point.time };
            ALL_SENSOR_KEYS.forEach((key) => {
              initialData[key] = null;
            });
            timeGroups[point.timestamp] = initialData;
          }
          timeGroups[point.timestamp][point.typeKey] = point.value;
        }

        const series = Object.values(timeGroups);
        setTimeSeriesData(series);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        console.error("Error fetching readings:", err);
        setError(err.message || "Gagal ambil data sensor");
        setTimeSeriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
    const interval = setInterval(fetchReadings, 3000);
    return () => clearInterval(interval);
  }, [part, backendLocationName, sensorMetadata]);

  const current = useMemo(() => {
    if (timeSeriesData.length === 0) return null;
    return timeSeriesData[timeSeriesData.length - 1];
  }, [timeSeriesData]);

  const activeMeta = SENSORS.find((s) => s.key === active);
  const ActiveIcon = activeMeta?.Icon ?? Activity;

  if (loading && timeSeriesData.length === 0) {
    return (
      <div className="min-h-screen bg-[#e9eef3] p-6 flex items-center justify-center">
        <div className="text-lg">Mengambil data sensor {label}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e9eef3] p-6 flex flex-col items-center justify-center text-red-600">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Gagal Memuat Data Sensor</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-slate-500 mb-4">
            Pastikan backend memiliki endpoint:
            <br />
            <code className="bg-slate-200 px-2 py-1 rounded">
              /sensor-readings
            </code>
            <br />
            dan
            <br />
            <code className="bg-slate-200 px-2 py-1 rounded">/sensor</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="neo-button mt-4"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9eef3] p-4 sm:p-6">
      <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
        <div className="neo-surface p-4 sm:p-5 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <ChevronLeft size={16} />
                Dashboard
              </Link>
              <span className="text-slate-400">/</span>
              <span className="truncate">{label}</span>
            </div>
            <div className="text-xl font-semibold text-slate-800 mt-1">
              {label} – Detail Sensor
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Pilih sensor untuk melihat tren terbaru.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NeoButton>Last 1h</NeoButton>
            <StatusBadge
              tone={error ? "danger" : "ok"}
              className="text-sm px-3 py-1"
            >
              {error ? "ERROR" : "5/5 ACTIVE"}
            </StatusBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SENSORS.map((s) => (
            <SensorCard
              key={s.key}
              label={s.label}
              unit={s.unit}
              value={current ? Number(current[s.key] ?? 0).toFixed(2) : "--"}
              status={error ? "danger" : "ok"}
              active={active === s.key}
              onClick={() => setActive(s.key)}
              Icon={s.Icon}
            />
          ))}
        </div>

        <div className="neo-surface p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="neo-inset p-2 flex items-center justify-center">
                <ActiveIcon size={18} className="text-emerald-600" />
              </span>
              <div>
                <div className="font-semibold text-slate-800">
                  Trend – {activeMeta?.label} ({activeMeta?.unit})
                </div>
                <div className="text-xs text-slate-500">Real-time data</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Clock size={14} />
              Updated: {lastUpdate || "—"}
            </div>
          </div>

          <div className="neo-inset p-4">
            <div className="h-[360px]">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeOpacity={0.15} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10 }}
                      interval="preserveEnd"
                      minTickGap={50}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [Number(value).toFixed(2), "Value"]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey={active}
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2 }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Tidak ada data untuk {label}.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {current ? (
              <>
                <div className="neo-inset p-4">
                  <div className="text-xs text-slate-500">Min / Avg / Max</div>
                  <div className="text-sm text-slate-700 mt-1">— / — / —</div>
                </div>
                <div className="neo-inset p-4">
                  <div className="text-xs text-slate-500">Last Update</div>
                  <div className="text-sm text-slate-700 mt-1">
                    {lastUpdate || "Just now"}
                  </div>
                </div>
                <div className="neo-inset p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <TriangleAlert size={14} />
                    Alert (1h)
                  </div>
                  <div className="text-sm text-slate-700 mt-1">0</div>
                </div>
              </>
            ) : (
              <div className="md:col-span-3 text-center text-slate-500 py-4">
                Tidak ada data untuk ditampilkan.
              </div>
            )}
          </div>
        </div>

        <div className="neo-surface p-4 sm:p-5">
          <div className="font-semibold text-slate-800 mb-3">Recent Events</div>
          <div className="hidden sm:block neo-inset p-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Sensor</th>
                  <th className="text-left py-2">Value</th>
                  <th className="text-left py-2">Severity</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-white/60">
                  <td className="py-2">—</td>
                  <td className="py-2">—</td>
                  <td className="py-2">—</td>
                  <td className="py-2">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="sm:hidden space-y-3">
            <div className="neo-inset p-4 text-sm text-slate-500">
              Belum ada event
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

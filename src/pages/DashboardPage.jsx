// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import {
  Thermometer, Waves, Gauge,
  Armchair, Footprints, Shield
} from "lucide-react";

// Konfigurasi
const LOCATIONS = [
  { id: "right-arm", label: "Lengan Kanan", icon: Armchair },
  { id: "left-arm", label: "Lengan Kiri", icon: Armchair },
  { id: "back", label: "Punggung", icon: Shield },
  { id: "left-leg", label: "Kaki Kiri", icon: Footprints },
  { id: "right-leg", label: "Kaki Kanan", icon: Footprints },
];

const SENSOR_TYPES = [
  { key: "humidity", label: "Humidity", Icon: Thermometer, unit: "°C" },
  { key: "pressure", label: "Pressure", Icon: Gauge, unit: "kPa" },
  { key: "vibration", label: "Vibration", Icon: Waves, unit: "g" },
];

const LOCATION_MAP = {
  "right arm": "right-arm",
  "left arm": "left-arm",
  "back": "back",
  "left leg": "left-leg",
  "right leg": "right-leg",
};

export default function DashboardPage() {
  const nav = useNavigate();
  const [sensorData, setSensorData] = useState({});

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    
    const fetchData = async () => {
      try {
        const [sensorsRes, readingsRes] = await Promise.all([
          fetch(`${API_BASE}/sensor`),
          fetch(`${API_BASE}/sensor-reading`)
        ]);
        const sensors = await sensorsRes.json();
        const readings = await readingsRes.json();

        // Kelompokkan data per (sensorType + location)
        const data = {};
        SENSOR_TYPES.forEach(st => {
          data[st.key] = {};
          LOCATIONS.forEach(loc => {
            data[st.key][loc.id] = {
              sensor1: null,
              sensor2: null,
              status: "ok"
            };
          });
        });

        // Isi nilai dari bacaan terbaru
        readings.forEach(r => {
          const sensor = sensors.find(s => s.id === r.sensor.id);
          if (!sensor) return;
          
          const locId = LOCATION_MAP[sensor.location.name];
          const typeKey = sensor.sensorType.name;
          const sensorNum = sensor.externalId; // 1 atau 2
          
          if (locId && data[typeKey] && data[typeKey][locId]) {
            data[typeKey][locId][`sensor${sensorNum}`] = parseFloat(r.value);
            
            // Tentukan status
            let status = "ok";
            if (typeKey === "temperature" && r.value > 38) status = "danger";
            if (typeKey === "pressure" && r.value > 50) status = "danger";
            data[typeKey][locId].status = status;
          }
        });

        setSensorData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#e9eef3] p-4 sm:p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="neo-surface p-4 sm:p-5 mb-6">
          <div className="text-lg font-semibold text-slate-800">Smart Skin Dashboard</div>
          <div className="text-sm text-slate-500">Real-time monitoring per sensor type</div>
        </div>

        {/* Grid: 3 kolom sensor type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SENSOR_TYPES.map(sensorType => (
            <div key={sensorType.key} className="neo-surface p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="neo-inset p-2">
                  <sensorType.Icon size={18} className="text-emerald-600" />
                </span>
                <h3 className="font-semibold text-slate-800">{sensorType.label}</h3>
                <span className="text-xs text-slate-500">({sensorType.unit})</span>
              </div>

              {/* List lokasi untuk sensor type ini */}
              <div className="space-y-3">
                {LOCATIONS.map(loc => {
                  const locData = sensorData[sensorType.key]?.[loc.id] || {};
                  return (
                    <button
                      key={loc.id}
                      onClick={() => nav(`/dashboard/${loc.id}/${sensorType.key}`)}
                      className="w-full text-left neo-inset p-3 hover:scale-[1.01] transition"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <loc.icon size={16} className="text-emerald-600" />
                          <span className="font-medium">{loc.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono">
                            S1: {locData.sensor1 !== null ? locData.sensor1.toFixed(1) : "--"}
                          </div>
                          <div className="text-sm font-mono">
                            S2: {locData.sensor2 !== null ? locData.sensor2.toFixed(1) : "--"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
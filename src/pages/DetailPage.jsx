import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import SensorCard from "../components/SensorCard";
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const PART_LABEL = {
    "right-arm": "Tangan Kanan",
    "left-arm": "Tangan Kiri",
    "right-leg": "Kaki Kanan",
    "left-leg": "Kaki Kiri",
};

const SENSORS = [
    { key: "temp", label: "Temperature", unit: "°C" },
    { key: "vib", label: "Vibration", unit: "A" },
    { key: "fric", label: "Friction", unit: "arb" },
    { key: "press", label: "Pressure", unit: "N" },
    { key: "str", label: "Stretch", unit: "mm" },
];

function makeDummySeries() {
    const now = Date.now();
    return Array.from({ length: 60 }).map((_, i) => {
        const t = new Date(now - (59 - i) * 60_000);
        return {
            time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            temp: 28 + Math.sin(i / 6) * 1.2,
            vib: 0.4 + Math.abs(Math.cos(i / 8)) * 0.8,
            fric: 12 + Math.sin(i / 10) * 2.5,
            press: 40 + Math.sin(i / 5) * 10,
            str: 2 + Math.sin(i / 7) * 0.6,
        };
    });
}

export default function DetailPage() {
    const { part } = useParams();
    const label = PART_LABEL[part] ?? part;

    const [active, setActive] = useState("press");
    const data = useMemo(() => makeDummySeries(), []);
    const current = data[data.length - 1];

    const activeMeta = SENSORS.find(s => s.key === active);

    return (
        <div className="min-h-screen bg-[#e9eef3] p-4 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                {/* Top */}
                <div className="neo-surface p-4 sm:p-5 flex items-center justify-between">
                    <div>
                        <div className="text-sm text-slate-500">
                            <Link to="/dashboard" className="underline">Dashboard</Link> / {label}
                        </div>
                        <div className="text-lg font-semibold text-slate-700 mt-1">{label} – Detail Sensor</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <NeoButton>Last 1h</NeoButton>
                        <StatusBadge tone="ok">5/5 ACTIVE</StatusBadge>
                    </div>
                </div>

                {/* KPI (Desktop: 5 kolom, Mobile: stack) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {SENSORS.map((s) => (
                        <SensorCard
                            key={s.key}
                            label={s.label}
                            unit={s.unit}
                            value={Number(current?.[s.key] ?? 0).toFixed(2)}
                            status="ok"
                            active={active === s.key}
                            onClick={() => setActive(s.key)}
                        />
                    ))}
                </div>

                {/* Chart */}
                <div className="neo-surface p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-slate-700">
                            Trend – {activeMeta?.label} ({activeMeta?.unit})
                        </div>
                        <div className="text-xs text-slate-500">Window: 60 min</div>
                    </div>

                    <div className="neo-inset p-4">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeOpacity={0.15} />
                                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey={active} strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="neo-inset p-4">
                            <div className="text-xs text-slate-500">Min / Avg / Max</div>
                            <div className="text-sm text-slate-700 mt-1">— / — / —</div>
                        </div>
                        <div className="neo-inset p-4">
                            <div className="text-xs text-slate-500">Last Update</div>
                            <div className="text-sm text-slate-700 mt-1">Just now</div>
                        </div>
                        <div className="neo-inset p-4">
                            <div className="text-xs text-slate-500">Alert (1h)</div>
                            <div className="text-sm text-slate-700 mt-1">0</div>
                        </div>
                    </div>
                </div>

                {/* Events: table desktop, list mobile */}
                <div className="neo-surface p-4 sm:p-5">
                    <div className="font-semibold text-slate-700 mb-3">Recent Events</div>

                    {/* Desktop table */}
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
                                    <td className="py-2">—</td><td className="py-2">—</td><td className="py-2">—</td><td className="py-2">—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile list */}
                    <div className="sm:hidden space-y-3">
                        <div className="neo-inset p-4 text-sm text-slate-500">Belum ada event</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

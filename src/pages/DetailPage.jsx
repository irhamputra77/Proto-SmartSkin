import { useMemo, useState } from "react";
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
    temp: { label: "Temperature", unit: "°C", Icon: Thermometer },
    vib: { label: "Vibration", unit: "A", Icon: Waves },
    press: { label: "Pressure", unit: "N", Icon: Gauge },
};

const PART_LABEL = {
    "right-arm": "Tangan Kanan",
    "left-arm": "Tangan Kiri",
    "right-leg": "Kaki Kanan",
    "left-leg": "Kaki Kiri",
    back: "Punggung",
};

const PARTS = ["left-arm", "right-arm", "left-leg", "right-leg", "back"];

// dummy value saat ini untuk setiap lokasi (per sensor)
function makeCurrentByPart() {
    return {
        "right-arm": { temp: 28.1, vib: 0.66, press: 41 },
        "left-arm": { temp: 28.4, vib: 0.72, press: 44 },
        "right-leg": { temp: 28.0, vib: 0.63, press: 46 },
        "left-leg": { temp: 27.9, vib: 0.58, press: 49 },
        back: { temp: 28.7, vib: 0.51, press: 38 },
    };
}

// dummy time-series untuk chart (berdasarkan sensorKey + part)
function makeSeries(sensorKey, part) {
    const now = Date.now();
    return Array.from({ length: 60 }).map((_, i) => {
        const t = new Date(now - (59 - i) * 60_000);

        const partBias =
            part === "back"
                ? 0.35
                : part === "left-arm"
                    ? 0.2
                    : part === "right-arm"
                        ? -0.1
                        : part === "left-leg"
                            ? -0.25
                            : 0.05;

        let val = 0;
        if (sensorKey === "temp") val = 28 + Math.sin(i / 6) * 1.2 + partBias;
        if (sensorKey === "vib") val = 0.45 + Math.abs(Math.cos(i / 8)) * 0.8 + partBias * 0.1;
        if (sensorKey === "press") val = 40 + Math.sin(i / 5) * 10 + partBias * 10;

        return {
            time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            v: val,
        };
    });
}

function fmt(v) {
    if (typeof v !== "number") return "0";
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function LocationPill({ label, value, unit, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={[
                "w-full text-left rounded-2xl transition select-none",
                // base neomorphism
                active
                    ? "neo-inset" // <- pressed look
                    : "neo-surface hover:scale-[1.01]",
                // spacing
                "p-4",
                // focus ring
                active ? "ring-2 ring-emerald-400/60" : "focus:ring-2 focus:ring-emerald-300/50",
                // pressed interaction feel
                "active:translate-y-[1px] active:scale-[0.99]",
                // make selected slightly lowered (clicked state)
                active ? "translate-y-[1px]" : "",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-slate-900">{label}</div>
                <StatusBadge tone="ok" className="text-xs px-3 py-1">
                    OK
                </StatusBadge>
            </div>

            <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-semibold text-slate-900">{fmt(value)}</div>
                <div className="text-sm font-medium text-slate-500">{unit}</div>
            </div>

            <div className="mt-1 text-xs text-slate-500">
                {active ? "Selected" : "Tap to focus"}
            </div>
        </button>
    );
}


export default function DetailPage() {
    const { sensorKey } = useParams(); // temp|vib|press
    const meta = SENSOR_META[sensorKey] ?? SENSOR_META.temp;
    const { Icon } = meta;

    const [activePart, setActivePart] = useState("back"); // default fokus punggung (boleh ubah)
    const currentByPart = useMemo(() => makeCurrentByPart(), []);
    const series = useMemo(() => makeSeries(sensorKey, activePart), [sensorKey, activePart]);

    const currentValue = currentByPart[activePart]?.[sensorKey] ?? 0;

    // optional hover (kalau mau tooltip nanti)
    const handleHoverPart = () => { };
    const handleLeavePart = () => { };

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
                            Klik mannequin / kartu lokasi untuk fokus grafik (1 sensor).
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
                            {/* BOX aspect sesuai gambar (2:3) */}
                            <div className="relative h-full max-h-full aspect-[2/3]">
                                <MannequinHotspotSVG
                                    className="absolute inset-0 w-full h-full"
                                    activePart={activePart}
                                    onClickPart={setActivePart}
                                    onHoverPart={handleHoverPart}
                                    onLeavePart={handleLeavePart}
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
                                Current:{" "}
                                <span className="font-semibold text-slate-900">{fmt(currentValue)}</span>{" "}
                                <span className="text-slate-500">{meta.unit}</span>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: chart */}
                    <section className="lg:col-span-8 neo-surface p-4 sm:p-6 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-slate-800">
                                Trend – {meta.label} ({meta.unit})
                            </div>
                            <div className="text-xs text-slate-500">Window: 60 min</div>
                        </div>

                        <div className="neo-inset p-4 flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={series}>
                                    <CartesianGrid strokeOpacity={0.15} />
                                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="v" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* LOCATION BAR (horizontal scroll, aman buat 5 lokasi) */}
                <div className="neo-surface p-3 sm:p-4">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {PARTS.map((id) => (
                            <div key={id} className="min-w-[260px] sm:min-w-[280px]">
                                <LocationPill
                                    label={PART_LABEL[id]}
                                    value={currentByPart[id]?.[sensorKey]}
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

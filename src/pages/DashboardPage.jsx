import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import MannequinSVG from "../components/MannequinSVG";

import {
    Armchair,
    Footprints,
    Thermometer,
    Waves,
    Grip,
    Gauge,
    StretchHorizontal,
    ShieldAlert,
    Siren,
    ChevronRight,
} from "lucide-react";

const LABEL = {
    "right-arm": "Tangan Kanan",
    "left-arm": "Tangan Kiri",
    "right-leg": "Kaki Kanan",
    "left-leg": "Kaki Kiri",
};

const LEFT_COL = ["left-arm", "left-leg"];
const RIGHT_COL = ["right-arm", "right-leg"];
const PART_ORDER = ["right-arm", "left-arm", "right-leg", "left-leg"]; // untuk auto demo (kalau dipakai)

const PART_ICON = {
    "right-arm": Armchair,
    "left-arm": Armchair,
    "right-leg": Footprints,
    "left-leg": Footprints,
};

const SENSOR_ITEMS = [
    { key: "temp", label: "Temp", Icon: Thermometer },
    { key: "vib", label: "Vib", Icon: Waves },
    { key: "fric", label: "Fric", Icon: Grip },
    { key: "press", label: "Press", Icon: Gauge },
    { key: "stretch", label: "Stretch", Icon: StretchHorizontal },
];

function makeDemoSummary() {
    return {
        "right-arm": { risk: 18, alert: 0, status: "ok" },
        "left-arm": { risk: 18, alert: 0, status: "ok" },
        "right-leg": { risk: 18, alert: 0, status: "ok" },
        "left-leg": { risk: 18, alert: 0, status: "ok" },
    };
}

function toneFromStatus(status) {
    if (status === "danger") return "danger";
    if (status === "warn") return "warn";
    return "ok";
}
function textFromStatus(status) {
    if (status === "danger") return "DANGER";
    if (status === "warn") return "WARNING";
    return "NORMAL";
}

function BodyPartCard({ id, label, risk, alert, status, active, onClick }) {
    const PartIcon = PART_ICON[id] || Armchair;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left neo-surface p-6 transition ${active ? "ring-2 ring-emerald-400/70" : "hover:scale-[1.01]"
                }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="neo-inset p-2 flex items-center justify-center">
                        <PartIcon size={18} className="text-emerald-600" />
                    </span>
                    <div className="leading-tight">
                        <h3 className="font-semibold text-slate-900 text-lg">{label}</h3>
                        <div className="text-sm text-slate-500 mt-0.5">5 sensors • realtime</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge tone={toneFromStatus(status)} className="text-sm px-3 py-1">
                        {textFromStatus(status)}
                    </StatusBadge>
                    <ChevronRight size={18} className="text-slate-400" />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="neo-inset p-4 min-h-[92px]">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <ShieldAlert size={16} />
                        Risk
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{risk}</div>
                </div>

                <div className="neo-inset p-4 min-h-[92px]">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Siren size={16} />
                        Alert
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{alert}</div>
                </div>
            </div>

            {/* Chip sensor rapih */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                {SENSOR_ITEMS.map(({ key, label, Icon }) => (
                    <div
                        key={key}
                        className="neo-inset px-3 py-2 flex items-center gap-2 text-sm text-slate-700"
                    >
                        <span className="neo-inset p-2 flex items-center justify-center">
                            <Icon size={16} className="text-emerald-600" />
                        </span>
                        <span className="font-semibold leading-none">{label}</span>
                    </div>
                ))}
            </div>
        </button>
    );
}

export default function DashboardPage() {
    const nav = useNavigate();
    const summary = useMemo(() => makeDemoSummary(), []);
    const [hovered, setHovered] = useState(null);

    // Auto demo (optional)
    const [autoDemo, setAutoDemo] = useState(false);
    const dwellMs = 2200;
    const idleMs = 5000;

    const idxRef = useRef(0);
    const demoTimeoutRef = useRef(null);
    const idleTimeoutRef = useRef(null);

    const clearTimers = () => {
        if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        demoTimeoutRef.current = null;
        idleTimeoutRef.current = null;
    };

    const scheduleNext = () => {
        demoTimeoutRef.current = setTimeout(() => {
            const id = PART_ORDER[idxRef.current % PART_ORDER.length];
            idxRef.current += 1;
            setHovered((prev) => (prev === id ? prev : id));
            scheduleNext();
        }, dwellMs);
    };

    useEffect(() => {
        clearTimers();
        if (!autoDemo) {
            setHovered(null);
            return;
        }
        scheduleNext();
        return () => clearTimers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoDemo]);

    const pauseAutoThenResume = () => {
        clearTimers();
        idleTimeoutRef.current = setTimeout(() => {
            if (autoDemo) scheduleNext();
        }, idleMs);
    };

    const handleHover = (id) => {
        setHovered((prev) => (prev === id ? prev : id));
        pauseAutoThenResume();
    };

    const handleLeave = () => {
        setHovered(null);
        pauseAutoThenResume();
    };

    const handleClick = (id) => {
        setHovered(id);
        pauseAutoThenResume();
        setTimeout(() => nav(`/dashboard/${id}`), 120);
    };

    return (
        <div className="min-h-screen bg-[#e9eef3] p-4 sm:p-6">
            <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
                {/* HEADER */}
                <div className="neo-surface p-4 sm:p-5 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-slate-500">Public Demo</div>
                        <div className="text-lg font-semibold text-slate-800">Smart Skin Dashboard</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NeoButton>Last 1h</NeoButton>

                        <button
                            className={`neo-pill px-4 py-2 text-sm ${autoDemo ? "text-emerald-700" : "text-slate-700"
                                }`}
                            onClick={() => setAutoDemo((v) => !v)}
                            title="Toggle Auto Demo"
                        >
                            {autoDemo ? "Auto Demo: ON" : "Auto Demo: OFF"}
                        </button>

                        <StatusBadge tone="ok">● ONLINE</StatusBadge>
                    </div>
                </div>

                {/* MAIN GRID: kiri - tengah - kanan */}
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4 sm:gap-6 items-stretch">
                    {/* LEFT TOP: Tangan Kiri */}
                    <aside className="space-y-4 order-2 lg:order-1">
                        <BodyPartCard
                            id="left-arm"
                            label={LABEL["left-arm"]}
                            risk={summary["left-arm"].risk}
                            alert={summary["left-arm"].alert}
                            status={summary["left-arm"].status}
                            active={hovered === "left-arm"}
                            onClick={() => nav(`/dashboard/left-arm`)}
                        />
                    </aside>

                    {/* CENTER: Mannequin (span 2 rows) */}
                    <section className="order-1 lg:order-2 lg:row-span-2 neo-surface p-4 sm:p-6 flex flex-col">
                        <div className="neo-inset p-4 relative overflow-hidden flex-1">
                            {/* Biar ukuran sejajar dan memenuhi tinggi kolom */}
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="w-full max-w-[460px] h-full">
                                    <div className="h-full aspect-[300/520] mx-auto">
                                        <MannequinSVG
                                            className="w-full h-full"
                                            hoveredPart={hovered}
                                            onHoverPart={handleHover}
                                            onLeavePart={handleLeave}
                                            onClickPart={handleClick}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-slate-500">
                            Tap/click area tangan/kaki untuk melihat detail 5 sensor.
                        </p>
                    </section>

                    {/* RIGHT TOP: Tangan Kanan */}
                    <aside className="space-y-4 order-3 lg:order-3">
                        <BodyPartCard
                            id="right-arm"
                            label={LABEL["right-arm"]}
                            risk={summary["right-arm"].risk}
                            alert={summary["right-arm"].alert}
                            status={summary["right-arm"].status}
                            active={hovered === "right-arm"}
                            onClick={() => nav(`/dashboard/right-arm`)}
                        />
                    </aside>

                    {/* LEFT BOTTOM: Kaki Kiri */}
                    <aside className="space-y-4 order-4 lg:order-4">
                        <BodyPartCard
                            id="left-leg"
                            label={LABEL["left-leg"]}
                            risk={summary["left-leg"].risk}
                            alert={summary["left-leg"].alert}
                            status={summary["left-leg"].status}
                            active={hovered === "left-leg"}
                            onClick={() => nav(`/dashboard/left-leg`)}
                        />
                    </aside>

                    {/* RIGHT BOTTOM: Kaki Kanan */}
                    <aside className="space-y-4 order-5 lg:order-5">
                        <BodyPartCard
                            id="right-leg"
                            label={LABEL["right-leg"]}
                            risk={summary["right-leg"].risk}
                            alert={summary["right-leg"].alert}
                            status={summary["right-leg"].status}
                            active={hovered === "right-leg"}
                            onClick={() => nav(`/dashboard/right-leg`)}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import MannequinSVG from "../components/MannequinSVG";

const LABEL = {
    "right-arm": "Tangan Kanan",
    "left-arm": "Tangan Kiri",
    "right-leg": "Kaki Kanan",
    "left-leg": "Kaki Kiri",
};

const PART_ORDER = ["right-arm", "left-arm", "right-leg", "left-leg"];

function makeDemoSummary() {
    return {
        "right-arm": { risk: 18, alert: 0, status: "ok" },
        "left-arm": { risk: 18, alert: 0, status: "ok" },
        "right-leg": { risk: 18, alert: 0, status: "ok" },
        "left-leg": { risk: 18, alert: 0, status: "ok" },
    };
}
const toneFromStatus = (s) => (s === "danger" ? "danger" : s === "warn" ? "warn" : "ok");
const textFromStatus = (s) => (s === "danger" ? "DANGER" : s === "warn" ? "WARNING" : "NORMAL");

function BodyPartCard({ label, risk, alert, status, active, onClick, cardRef }) {
    return (
        <button
            ref={cardRef}
            onClick={onClick}
            className={`w-full text-left neo-surface p-5 transition ${active ? "ring-2 ring-emerald-400/60" : "hover:scale-[1.01]"
                }`}
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">{label}</h3>
                <StatusBadge tone={toneFromStatus(status)}>{textFromStatus(status)}</StatusBadge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="neo-inset p-3">
                    <div className="text-slate-500 text-xs">Risk</div>
                    <div className="text-slate-700 font-semibold">{risk}</div>
                </div>
                <div className="neo-inset p-3">
                    <div className="text-slate-500 text-xs">Alert</div>
                    <div className="text-slate-700 font-semibold">{alert}</div>
                </div>
            </div>

            <div className="mt-3 text-xs text-slate-500">Temp • Vib • Fric • Press • Stretch</div>
        </button>
    );
}

export default function DashboardPage() {
    const nav = useNavigate();
    const summary = useMemo(() => makeDemoSummary(), []);

    const [hovered, setHovered] = useState(null);

    // ===== Presentation Auto Demo =====
    const [autoDemo, setAutoDemo] = useState(true);
    const dwellMs = 2200;
    const idleMs = 5000;

    const idxRef = useRef(0);
    const loopRef = useRef(null);
    const idleRef = useRef(null);

    // refs untuk auto-scroll card panel
    const cardRefs = useRef({
        "right-arm": null,
        "left-arm": null,
        "right-leg": null,
        "left-leg": null,
    });

    // Tooltip near body: posisi pixel relatif container
    const canvasRef = useRef(null);
    const [tip, setTip] = useState(null); // {x,y,id}

    const stopTimers = () => {
        if (loopRef.current) clearInterval(loopRef.current);
        if (idleRef.current) clearTimeout(idleRef.current);
        loopRef.current = null;
        idleRef.current = null;
    };

    const startLoop = () => {
        stopTimers();
        loopRef.current = setInterval(() => {
            const id = PART_ORDER[idxRef.current % PART_ORDER.length];
            idxRef.current += 1;
            activatePart(id, { fromAuto: true });
        }, dwellMs);
    };

    const pauseTemporarily = () => {
        stopTimers();
        idleRef.current = setTimeout(() => {
            if (autoDemo) startLoop();
        }, idleMs);
    };

    useEffect(() => {
        if (!autoDemo) {
            stopTimers();
            setHovered(null);
            setTip(null);
            return;
        }
        startLoop();
        return () => stopTimers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoDemo]);

    // aktifkan highlight + scroll card
    const activatePart = (id, { fromAuto = false } = {}) => {
        setHovered(id);

        // auto-scroll side card (hanya desktop; tetap aman di mobile)
        const el = cardRefs.current[id];
        if (el?.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        // kalau user interaksi, pause; kalau auto, tidak perlu pause
        if (!fromAuto) pauseTemporarily();
    };

    // terima anchor dari SVG (koordinat viewBox), konversi ke pixel canvas
    const handlePartAnchor = (id, anchor) => {
        if (!anchor || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // viewBox = 300 x 520, kita map ke ukuran canvas
        const x = (anchor.x / 300) * rect.width;
        const y = (anchor.y / 520) * rect.height;

        // offset biar tooltip tidak nutup hotspot
        const offsetX = anchor.x < 150 ? 14 : -14;
        const offsetY = -10;

        setTip({ id, x: x + offsetX, y: y + offsetY });
    };

    const handleHover = (id) => activatePart(id, { fromAuto: false });
    const handleLeave = () => {
        setHovered(null);
        setTip(null);
        pauseTemporarily();
    };

    const handleClick = (id) => {
        // tampilkan tooltip sebentar, lalu navigasi
        activatePart(id, { fromAuto: false });
        setTimeout(() => nav(`/dashboard/${id}`), 140);
    };

    return (
        <div className="min-h-screen bg-[#e9eef3] p-4 sm:p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4 sm:gap-6">
                {/* HEADER */}
                <div className="col-span-12 neo-surface p-4 sm:p-5 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-slate-500">Public Demo</div>
                        <div className="text-lg font-semibold text-slate-700">Smart Skin Dashboard</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NeoButton>Last 1h</NeoButton>

                        <button
                            className={`neo-pill px-4 py-2 text-sm ${autoDemo ? "text-emerald-700" : "text-slate-700"}`}
                            onClick={() => setAutoDemo((v) => !v)}
                            title="Toggle Auto Demo"
                        >
                            {autoDemo ? "Auto Demo: ON" : "Auto Demo: OFF"}
                        </button>

                        <StatusBadge tone="ok">● ONLINE</StatusBadge>
                    </div>
                </div>

                {/* MAIN CANVAS */}
                <section className="col-span-12 lg:col-span-8 neo-surface p-4 sm:p-6">
                    <div className="neo-inset p-4 relative overflow-hidden">
                        <div ref={canvasRef} className="w-full max-h-[520px] aspect-[300/520] mx-auto relative">
                            <MannequinSVG
                                className="w-full h-[520px] max-h-[520px] mx-auto"
                                hoveredPart={hovered}
                                onHoverPart={handleHover}
                                onLeavePart={handleLeave}
                                onClickPart={handleClick}
                                onPartAnchor={handlePartAnchor}
                            />

                            {/* Tooltip dekat area tubuh */}
                            {tip?.id && (
                                <div
                                    className="absolute neo-surface px-4 py-3"
                                    style={{
                                        left: `${tip.x}px`,
                                        top: `${tip.y}px`,
                                        transform: tip.x < (canvasRef.current?.getBoundingClientRect().width ?? 0) / 2
                                            ? "translate(0,-50%)"
                                            : "translate(-100%,-50%)",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <div className="font-semibold text-slate-700 text-sm">{LABEL[tip.id]}</div>
                                    <div className="text-xs text-slate-500 mt-1">Klik untuk melihat detail 5 sensor</div>
                                </div>
                            )}
                        </div>
                    </div>

                </section>

                {/* SIDE PANEL */}
                <aside className="col-span-12 lg:col-span-4 space-y-4">
                    {PART_ORDER.map((id) => (
                        <BodyPartCard
                            key={id}
                            label={LABEL[id]}
                            risk={summary[id].risk}
                            alert={summary[id].alert}
                            status={summary[id].status}
                            active={hovered === id}
                            onClick={() => nav(`/dashboard/${id}`)}
                            cardRef={(el) => (cardRefs.current[id] = el)}
                        />
                    ))}
                </aside>
            </div>
        </div>
    );
}

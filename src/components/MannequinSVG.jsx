import { useMemo, useState } from "react";

export default function MannequinHotspotSVG({
    className = "",
    activePart,
    onClickPart,
    onHoverPart,
    onLeavePart,
    imageHref = "/mannequin-back.png",
}) {
    const [hoverId, setHoverId] = useState(null);

    const SENSORS = useMemo(
        () => [
            { id: "back", x: 50, y: 30 },
            { id: "left-arm", x: 34, y: 45 },
            { id: "right-arm", x: 67, y: 45 },
            { id: "left-leg", x: 43.2, y: 85 },
            { id: "right-leg", x: 58.2, y: 85 },
        ],
        []
    );

    const isActive = (id) => activePart === id;
    const isHover = (id) => hoverId === id;

    // ======== ukuran ========
    const DOT_R = 2;
    const HALO_R = 6;

    // ======== pulse ========
    const PULSE_R_FROM = HALO_R - 1;
    const PULSE_R_TO = HALO_R + 7;
    const PULSE_DUR = "1.2s";

    // ======== palet warna ========
    const ACTIVE_DOT = "rgba(16,185,129,1)";
    const ACTIVE_RING = "rgba(16,185,129,0.75)";
    const ACTIVE_HALO = "rgba(16,185,129,0.24)";

    const IDLE_DOT = "rgba(16,185,129,0.85)";
    const IDLE_RING = "rgba(16,185,129,0.45)";
    const IDLE_HALO = "rgba(16,185,129,0.14)";

    const DIM_DOT = "rgba(16,185,129,0.60)";
    const DIM_RING = "rgba(16,185,129,0.35)";
    const DIM_HALO = "rgba(16,185,129,0.14)";

    return (
        <svg
            className={className}
            viewBox="0 0 100 150"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
        >

            <defs>
                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur1" />
                    <feColorMatrix
                        in="blur1"
                        type="matrix"
                        values="
                                    0 0 0 0 0.06
                                    0 0 0 0 0.85
                                    0 0 0 0 0.55
                                    0 0 0 0.95 0
                                "
                        result="glow1"
                    />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4.8" result="blur2" />
                    <feColorMatrix
                        in="blur2"
                        type="matrix"
                        values="
                                    0 0 0 0 0.06
                                    0 0 0 0 0.85
                                    0 0 0 0 0.55
                                    0 0 0 0.55 0
                                "
                        result="glow2"
                    />

                    <feMerge>
                        <feMergeNode in="glow2" />
                        <feMergeNode in="glow1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <image
                href={imageHref}
                x="0"
                y="0"
                width="100"
                height="150"
                preserveAspectRatio="xMidYMid meet"
            />

            {SENSORS.map((s) => {
                const active = isActive(s.id);
                const hover = isHover(s.id);
                const dimOthers = Boolean(activePart) && !active;

                const dotFill = active ? ACTIVE_DOT : dimOthers ? DIM_DOT : IDLE_DOT;
                const ringStroke = active ? ACTIVE_RING : dimOthers ? DIM_RING : IDLE_RING;
                const haloFill = active ? ACTIVE_HALO : dimOthers ? DIM_HALO : IDLE_HALO;
                const haloOpacity = active ? 0.45 : hover ? 0.28 : dimOthers ? 0.12 : 0.18;
                const ringOpacity = active ? 1 : hover ? 0.65 : dimOthers ? 0.35 : 0.5;
                const dotOpacity = active ? 1 : hover ? 0.9 : dimOthers ? 0.55 : 0.85;

                return (
                    <g
                        key={s.id}
                        onMouseEnter={() => { setHoverId(s.id); onHoverPart?.(s.id); }}
                        onMouseLeave={() => { setHoverId(null); onLeavePart?.(); }}
                        onClick={() => onClickPart?.(s.id)}
                        style={{
                            cursor: "pointer",
                            transition: "opacity 160ms ease",
                            opacity: dimOthers ? 0.85 : 1,
                            filter: active ? "url(#neonGlow)" : "none",
                        }}
                    >
                        {active && (
                            <circle
                                cx={s.x}
                                cy={s.y}
                                r={PULSE_R_FROM}
                                fill="transparent"
                                stroke="rgba(16,185,129,0.55)"
                                strokeWidth="2"
                                opacity="0.7"
                                pointerEvents="none"
                            >
                                <animate
                                    attributeName="r"
                                    values={`${PULSE_R_FROM};${PULSE_R_TO}`}
                                    dur={PULSE_DUR}
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0.65;0"
                                    dur={PULSE_DUR}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        )}

                        {/* halo */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={HALO_R}
                            fill={haloFill}
                            opacity={haloOpacity}
                        />
                        {/* ring */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={HALO_R - 2}
                            fill="transparent"
                            stroke={ringStroke}
                            strokeWidth="1.4"
                            opacity={ringOpacity}
                        />
                        {/* dot */}
                        <circle
                            cx={s.x}
                            cy={s.y}
                            r={DOT_R}
                            fill={dotFill}
                            opacity={dotOpacity}
                        />
                    </g>
                );
            })}
        </svg>
    );
}

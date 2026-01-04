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

    const dotFill = "rgba(16,185,129,1)";
    const ringStroke = "rgba(16,185,129,0.65)";
    const haloFill = "rgba(16,185,129,0.22)";

    const DOT_R = 2;
    const HALO_R = 6;

    return (
        <svg
            className={className}
            viewBox="0 0 100 150"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Mannequin di dalam SVG -> titik akan selalu align */}
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

                const haloOpacity = active ? 0.38 : hover ? 0.28 : 0.18;
                const ringOpacity = active ? 0.95 : hover ? 0.75 : 0.45;

                return (
                    <g
                        key={s.id}
                        onMouseEnter={() => {
                            setHoverId(s.id);
                            onHoverPart?.(s.id);
                        }}
                        onMouseLeave={() => {
                            setHoverId(null);
                            onLeavePart?.();
                        }}
                        onClick={() => onClickPart?.(s.id)}
                        style={{ cursor: "pointer" }}
                    >
                        {/* halo */}
                        <circle cx={s.x} cy={s.y} r={HALO_R} fill={haloFill} opacity={haloOpacity} />
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
                        {/* dot utama */}
                        <circle cx={s.x} cy={s.y} r={DOT_R} fill={dotFill} />

                        {/* label kecil saat hover/active (opsional, tapi enak buat UX) */}

                    </g>
                );
            })}
        </svg>
    );
}

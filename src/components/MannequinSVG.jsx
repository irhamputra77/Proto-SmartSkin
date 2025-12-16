export default function MannequinSVG({
    className = "",
    hoveredPart,
    onHoverPart,
    onLeavePart,
    onClickPart,
    onPartAnchor, // (id, {x,y}) -> posisi tooltip dalam koordinat viewBox SVG
}) {
    const is = (id) => hoveredPart === id;

    const hotspotStyle = (id) => ({
        fill: is(id) ? "rgba(34,197,94,0.18)" : "rgba(0,0,0,0)",
        stroke: is(id) ? "rgba(34,197,94,0.65)" : "rgba(255,255,255,0)",
        strokeWidth: is(id) ? 2 : 0,
        cursor: "pointer",
        pointerEvents: "all",
        touchAction: "manipulation",
    });

    // Anchor tooltip (koordinat viewBox 300x520)
    const ANCHOR = {
        "left-arm": { x: 75, y: 245 },
        "right-arm": { x: 225, y: 245 },
        "left-leg": { x: 135, y: 455 },
        "right-leg": { x: 165, y: 455 },
    };

    const enter = (id) => {
        onHoverPart?.(id);
        onPartAnchor?.(id, ANCHOR[id]);
    };

    const click = (id) => {
        onClickPart?.(id);
        onPartAnchor?.(id, ANCHOR[id]);
    };

    return (
        <div className={className}>
            <svg
                viewBox="0 0 300 520"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Mannequin"
            >
                <defs>
                    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="60%" stopColor="#e6edf5" stopOpacity="1" />
                        <stop offset="100%" stopColor="#dbe5ef" stopOpacity="1" />
                    </linearGradient>

                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#9fb1c6" floodOpacity="0.35" />
                    </filter>
                </defs>

                {/* Body */}
                <g filter="url(#softShadow)">
                    <ellipse cx="150" cy="70" rx="48" ry="52" fill="url(#bodyGrad)" />
                    <rect x="126" y="118" width="48" height="34" rx="18" fill="url(#bodyGrad)" />

                    <path
                        d="M90 160
               C90 140, 115 132, 150 132
               C185 132, 210 140, 210 160
               L230 260
               C235 292, 215 315, 190 320
               L190 350
               C190 380, 175 400, 150 400
               C125 400, 110 380, 110 350
               L110 320
               C85 315, 65 292, 70 260
               Z"
                        fill="url(#bodyGrad)"
                    />

                    {/* Arms */}
                    <path d="M82 185 C55 215, 52 250, 66 290 C74 314, 92 320, 105 312 L110 205 Z" fill="url(#bodyGrad)" />
                    <path d="M218 185 C245 215, 248 250, 234 290 C226 314, 208 320, 195 312 L190 205 Z" fill="url(#bodyGrad)" />

                    {/* Legs */}
                    <path d="M112 400 L132 500 C136 512, 150 512, 154 500 L148 400 Z" fill="url(#bodyGrad)" />
                    <path d="M188 400 L168 500 C164 512, 150 512, 146 500 L152 400 Z" fill="url(#bodyGrad)" />
                </g>

                {/* Sensor nodes */}
                <g filter="url(#glow)">
                    {[
                        [115, 190], [185, 190],
                        [150, 250],
                        [95, 260], [205, 260],
                        [135, 430], [165, 430],
                    ].map(([x, y], idx) => (
                        <circle key={idx} cx={x} cy={y} r="7" fill="#22C55E" opacity="0.65" />
                    ))}
                </g>

                {/* Hotspot layer */}
                <g>
                    <path
                        d="M82 185 C55 215, 52 250, 66 290 C74 314, 92 320, 105 312 L110 205 Z"
                        style={hotspotStyle("left-arm")}
                        onPointerEnter={() => enter("left-arm")}
                        onPointerLeave={() => onLeavePart?.()}
                        onClick={() => click("left-arm")}
                    />
                    <path
                        d="M218 185 C245 215, 248 250, 234 290 C226 314, 208 320, 195 312 L190 205 Z"
                        style={hotspotStyle("right-arm")}
                        onPointerEnter={() => enter("right-arm")}
                        onPointerLeave={() => onLeavePart?.()}
                        onClick={() => click("right-arm")}
                    />
                    <path
                        d="M112 400 L132 500 C136 512, 150 512, 154 500 L148 400 Z"
                        style={hotspotStyle("left-leg")}
                        onPointerEnter={() => enter("left-leg")}
                        onPointerLeave={() => onLeavePart?.()}
                        onClick={() => click("left-leg")}
                    />
                    <path
                        d="M188 400 L168 500 C164 512, 150 512, 146 500 L152 400 Z"
                        style={hotspotStyle("right-leg")}
                        onPointerEnter={() => enter("right-leg")}
                        onPointerLeave={() => onLeavePart?.()}
                        onClick={() => click("right-leg")}
                    />
                </g>
            </svg>
        </div>
    );
}

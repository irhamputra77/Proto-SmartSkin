export default function StatusBadge({ tone = "ok", children }) {
    const map = {
        ok: "text-emerald-700",
        warn: "text-amber-700",
        danger: "text-red-700",
        info: "text-slate-700",
    };
    return (
        <span className={`neo-pill px-3 py-1 text-xs ${map[tone] ?? map.info}`}>
            {children}
        </span>
    );
}

import StatusBadge from "./StatusBadge";

export default function SensorCard({
    label,
    value,
    unit,
    active,
    status = "ok",
    onClick,
    Icon, // ✅ tambah: icon component (lucide-react)
}) {
    return (
        <button
            onClick={onClick}
            className={`neo-surface p-5 text-left transition w-full ${active ? "ring-2 ring-emerald-400/70" : "hover:scale-[1.01]"
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {Icon ? (
                        <span className="neo-inset p-2 flex items-center justify-center shrink-0">
                            <Icon size={18} className="text-emerald-600" />
                        </span>
                    ) : null}

                    <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-600 truncate">{label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Realtime value</div>
                    </div>
                </div>

                <StatusBadge tone={status} className="text-xs px-3 py-1">
                    {status.toUpperCase()}
                </StatusBadge>
            </div>

            {/* Value */}
            <div className="mt-4 flex items-end justify-between">
                <div className="text-2xl font-semibold text-slate-900 leading-none">
                    {value}
                </div>
                <div className="text-sm font-medium text-slate-500">{unit}</div>
            </div>

            {/* Small hint */}
            <div className="mt-3 text-xs text-slate-500">
                Click to view trend
            </div>
        </button>
    );
}

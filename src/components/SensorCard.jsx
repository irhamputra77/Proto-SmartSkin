import StatusBadge from "./StatusBadge";

export default function SensorCard({ label, value, unit, active, status = "ok", onClick }) {
    return (
        <button
            onClick={onClick}
            className={`neo-surface p-4 text-left transition w-full ${active ? "ring-2 ring-emerald-400/60" : ""
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">{label}</div>
                <StatusBadge tone={status}>{status.toUpperCase()}</StatusBadge>
            </div>

            <div className="mt-2 text-lg font-semibold text-slate-700">
                {value} <span className="text-xs text-slate-500">{unit}</span>
            </div>
        </button>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NeoButton from "../components/NeoButton";
import StatusBadge from "../components/StatusBadge";
import { ChevronLeft, CalendarDays, Download, ScrollText } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api-ss.stas-rg.com";

const PREVIEW_LIMIT = 15;

const SENSOR_TYPES = [
    { value: "all", label: "All types" },
    { value: "temperature", label: "Temperature (°C)" },
    { value: "pressure", label: "Pressure (N)" },
    { value: "vibration", label: "Vibration (V)" },
    { value: "flex", label: "Flex (Ω)" },
    { value: "strain", label: "Strain (µε)" },
];

const LOCATIONS = [
    { value: "all", label: "All locations" },
    { value: "right_arm", label: "Right Arm" },
    { value: "left_arm", label: "Left Arm" },
    { value: "back", label: "Back" },
    { value: "right_leg", label: "Right Leg" },
    { value: "left_leg", label: "Left Leg" },
    { value: "right_elbow", label: "Right Elbow" },
    { value: "left_elbow", label: "Left Elbow" },
    { value: "right_knee", label: "Right Knee" },
    { value: "left_knee", label: "Left Knee" },
];

// Mirrors backend SensorReadingService.DANGER_THRESHOLD
const DANGER_THRESHOLD = {
    temperature: 38,
    pressure: 70,
    vibration: 3,
    flex: 105000,
    strain: 20000,
};

function fmt(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "-";
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function fmtFullTs(ts) {
    const d = new Date(ts);
    if (!Number.isFinite(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function LogsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mannequinId = Number(searchParams.get("mannequin")) || 1;
    const setMannequinId = (id) => {
        const next = new URLSearchParams(searchParams);
        next.set("mannequin", String(id));
        setSearchParams(next, { replace: true });
    };

    const [date, setDate] = useState(todayStr);
    const [sensorType, setSensorType] = useState("all");
    const [location, setLocation] = useState("all");

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Reset to first page whenever the filters change
    useEffect(() => {
        setPage(1);
    }, [date, sensorType, location, mannequinId]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchPreview = async () => {
            setLoading(true);
            try {
                const url = new URL(`${API_BASE}/sensor-reading/paginated`);
                url.searchParams.set("mannequin_id", String(mannequinId));
                url.searchParams.set("startDate", `${date}T00:00:00.000`);
                url.searchParams.set("endDate", `${date}T23:59:59.999`);
                if (sensorType !== "all") url.searchParams.set("sensorType", sensorType);
                if (location !== "all") url.searchParams.set("location", location);
                url.searchParams.set("page", String(page));
                url.searchParams.set("limit", String(PREVIEW_LIMIT));

                const res = await fetch(url.toString(), {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error("Failed to fetch logs");

                const json = await res.json();
                setRows(Array.isArray(json?.data) ? json.data : []);
                setTotal(json?.meta?.total ?? 0);
                setTotalPages(Math.max(1, json?.meta?.totalPages ?? 1));
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("Error fetching logs:", err);
                setRows([]);
                setTotal(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
        return () => controller.abort();
    }, [date, sensorType, location, mannequinId, page]);

    const handleExport = () => {
        setExporting(true);
        try {
            const url = new URL(`${API_BASE}/sensor-reading/export`);
            url.searchParams.set("date", date);
            url.searchParams.set("mannequin_id", String(mannequinId));
            if (sensorType !== "all") url.searchParams.set("sensorType", sensorType);
            if (location !== "all") url.searchParams.set("location", location);

            // Server responds with Content-Disposition: attachment → browser downloads.
            const link = document.createElement("a");
            link.href = url.toString();
            link.rel = "noopener";
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            setExporting(false);
        }
    };

    const rangeLabel = useMemo(() => {
        if (total === 0) return "0 reading";
        const from = (page - 1) * PREVIEW_LIMIT + 1;
        const to = Math.min(page * PREVIEW_LIMIT, total);
        return `${from}–${to} dari ${total} reading`;
    }, [page, total]);

    return (
        <div className="min-h-dvh bg-[#e9eef3] p-3 sm:p-6">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-4 sm:gap-6">
                {/* Header */}
                <div className="neo-surface p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm text-slate-500">
                            <Link
                                to={`/dashboard?mannequin=${mannequinId}`}
                                className="inline-flex items-center gap-2 hover:underline"
                            >
                                <ChevronLeft size={16} />
                                Dashboard
                            </Link>
                        </div>
                        <div className="text-xl font-semibold text-slate-800 mt-1 flex items-center gap-2">
                            <span className="neo-inset p-2 inline-flex items-center justify-center">
                                <ScrollText size={18} className="text-emerald-600" />
                            </span>
                            Sensor Logs – Export
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Pilih tanggal & filter, lalu export reading ke CSV.
                        </div>
                    </div>

                    <select
                        value={mannequinId}
                        onChange={(e) => setMannequinId(Number(e.target.value))}
                        className="neo-inset px-3 py-2 rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer self-start sm:self-auto"
                    >
                        <option value={1}>Mannequin 1</option>
                        <option value={2}>Mannequin 2</option>
                    </select>
                </div>

                {/* Filters */}
                <div className="neo-surface p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <CalendarDays size={13} /> Tanggal
                            </span>
                            <input
                                type="date"
                                value={date}
                                max={todayStr()}
                                onChange={(e) => setDate(e.target.value)}
                                className="neo-inset px-3 py-2 rounded-xl text-sm font-medium text-slate-700 outline-none"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500">Sensor Type</span>
                            <select
                                value={sensorType}
                                onChange={(e) => setSensorType(e.target.value)}
                                className="neo-inset px-3 py-2 rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            >
                                {SENSOR_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500">Location</span>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="neo-inset px-3 py-2 rounded-xl text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            >
                                {LOCATIONS.map((l) => (
                                    <option key={l.value} value={l.value}>
                                        {l.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <NeoButton
                            onClick={handleExport}
                            disabled={exporting || total === 0}
                            className="justify-center"
                        >
                            <span className="inline-flex items-center gap-2">
                                <Download size={15} />
                                {exporting ? "Exporting…" : "Export CSV"}
                            </span>
                        </NeoButton>
                    </div>
                </div>

                {/* Preview table */}
                <div className="neo-surface p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <div className="font-semibold text-slate-800">Preview</div>
                        <div className="text-xs text-slate-500">{loading ? "Loading…" : rangeLabel}</div>
                    </div>

                    <div className="neo-inset rounded-xl overflow-hidden">
                        <div className="max-h-[460px] overflow-auto">
                            <table className="w-full text-sm min-w-[640px]">
                                <thead className="sticky top-0 bg-[#e9eef3] text-slate-600">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-2.5 w-16">No</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Timestamp</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Location</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Type</th>
                                        <th className="text-center font-semibold px-4 py-2.5 w-20">Sensor</th>
                                        <th className="text-right font-semibold px-4 py-2.5">Value</th>
                                        <th className="text-center font-semibold px-4 py-2.5 w-24">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                                Loading…
                                            </td>
                                        </tr>
                                    ) : rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                                Tidak ada reading pada tanggal & filter ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((r, i) => {
                                            const typeName = r?.sensor?.sensorType?.name ?? "";
                                            const unit = r?.sensor?.sensorType?.unit ?? "";
                                            const val = r?.value != null ? Number(r.value) : null;
                                            const threshold = DANGER_THRESHOLD[typeName];
                                            const isOver =
                                                Number.isFinite(val) &&
                                                Number.isFinite(threshold) &&
                                                val > threshold;
                                            return (
                                                <tr key={r?.id ?? i} className="border-t border-white/50">
                                                    <td className="px-4 py-2.5 text-slate-500 tabular-nums">
                                                        {(page - 1) * PREVIEW_LIMIT + i + 1}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-700 tabular-nums whitespace-nowrap">
                                                        {fmtFullTs(r?.timestamp)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-700 capitalize">
                                                        {r?.sensor?.location?.name ?? "-"}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-700 capitalize">{typeName || "-"}</td>
                                                    <td className="px-4 py-2.5 text-center text-slate-700 tabular-nums">
                                                        {r?.sensor?.externalId ?? "-"}
                                                    </td>
                                                    <td
                                                        className={[
                                                            "px-4 py-2.5 text-right font-semibold tabular-nums whitespace-nowrap",
                                                            isOver ? "text-red-600" : "text-slate-900",
                                                        ].join(" ")}
                                                    >
                                                        {val != null ? fmt(val) : "-"} {unit}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <StatusBadge tone={isOver ? "danger" : "ok"}>
                                                            {isOver ? "OVER" : "OK"}
                                                        </StatusBadge>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-slate-500">
                            Halaman {page} / {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <NeoButton
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1 || loading}
                            >
                                Prev
                            </NeoButton>
                            <NeoButton
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages || loading}
                            >
                                Next
                            </NeoButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function getReadings({ part, from, to }) {
    const url = new URL(`${BASE}/readings`);
    url.searchParams.set("part", part);
    if (from) url.searchParams.set("from", from);
    if (to) url.searchParams.set("to", to);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch readings");
    return res.json();
}

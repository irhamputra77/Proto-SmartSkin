import { getToken, clearSession } from "./auth";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://api-ss.stas-rg.com";

// Build an absolute API URL from a path ("/sensor-reading/latest").
export function apiUrl(path) {
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// fetch() wrapper that attaches the Bearer token and centralizes 401 handling.
// Accepts a path string, an absolute URL string, or a URL object.
export async function apiFetch(input, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const target =
        typeof input === "string" ? apiUrl(input) : input.toString();

    const res = await fetch(target, { ...options, headers });

    if (res.status === 401) {
        // Token missing/expired/invalid → drop session and bounce to login.
        clearSession();
        if (window.location.pathname !== "/login") {
            const from = window.location.pathname + window.location.search;
            window.location.assign(`/login?next=${encodeURIComponent(from)}`);
        }
        throw new Error("Unauthorized");
    }

    return res;
}

// Lightweight client-side session helpers backed by localStorage.
// NOTE: localStorage is readable by JS (XSS-exposed). Acceptable for this
// internal tool; an httpOnly cookie would be more secure but needs more plumbing.
const TOKEN_KEY = "smartskin_token";
const USER_KEY = "smartskin_user";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
    return Boolean(getToken());
}

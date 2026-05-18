import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api-ss.stas-rg.com';
const POLL_INTERVAL_MS = 5000;

// Polls GET /lora/health?mid=X every 5s.
// Server-truth source: secondsAgo is computed on the backend, immune to client clock skew.
export function useMannequinHealth(mannequinId) {
    const [health, setHealth] = useState({
        lastSeen: null,
        secondsAgo: null,
        status: null,
    });

    useEffect(() => {
        let cancelled = false;
        let controller = null;

        const fetchHealth = async () => {
            controller?.abort();
            controller = new AbortController();

            try {
                const res = await fetch(
                    `${API_BASE}/lora/health?mid=${mannequinId}`,
                    { cache: 'no-store', signal: controller.signal }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                setHealth({
                    lastSeen: data.lastSeen ?? null,
                    secondsAgo: data.secondsAgo ?? null,
                    status: data.status ?? null,
                });
            } catch (err) {
                if (err?.name !== 'AbortError') {
                    // periodic poll — swallow transient failures
                }
            }
        };

        fetchHealth();
        const timerId = setInterval(fetchHealth, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(timerId);
            controller?.abort();
        };
    }, [mannequinId]);

    return health;
}

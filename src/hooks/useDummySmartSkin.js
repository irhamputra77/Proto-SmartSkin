import { useEffect, useMemo, useState } from "react";
import { makeInitialStore, tickStore } from "../lib/dummySmartSkin";

export default function useDummySmartSkin({ realtime = true, intervalMs = 3000 } = {}) {
    const [store, setStore] = useState(() => makeInitialStore(60));

    useEffect(() => {
        if (!realtime) return;
        const id = setInterval(() => setStore(prev => tickStore(prev)), intervalMs);
        return () => clearInterval(id);
    }, [realtime, intervalMs]);

    return useMemo(() => ({ store, setStore }), [store]);
}

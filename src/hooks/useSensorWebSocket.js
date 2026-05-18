import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-ss.stas-rg.com';

export function useSensorWebSocket(mannequinId) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [latestBatch, setLatestBatch] = useState([]);
    // Increments each time the socket (re)connects. Consumers can add this to
    // an effect's deps to re-fetch fresh data after a disconnect → reconnect.
    const [connectionEpoch, setConnectionEpoch] = useState(0);

    useEffect(() => {
        const socket = io(`${WS_URL}/sensor`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            setConnectionEpoch((n) => n + 1);
        });
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('sensor-batch-update', (readings) => {
            const filtered = readings.filter((r) => r.mannequin_id === mannequinId);
            if (filtered.length > 0) setLatestBatch(filtered);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [mannequinId]);

    return { isConnected, latestBatch, connectionEpoch };
}

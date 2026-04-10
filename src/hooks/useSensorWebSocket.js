import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export function useSensorWebSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState({});

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(`${WS_URL}/sensor`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('sensor-update', (data) => {
      console.log('📡 sensor-update:', data);
      setLatestData((prev) => ({
        ...prev,
        [`${data.sensorType}-${data.location}`]: data,
      }));
    });

    socket.on('sensor-batch-update', (readings) => {
      console.log('📡 sensor-batch-update:', readings.length, 'readings');
      const updates = {};
      readings.forEach((r) => {
        updates[`${r.sensorType}-${r.location}`] = r;
      });
      setLatestData((prev) => ({ ...prev, ...updates }));
    });

    socket.on('latest-summary', (summary) => {
      console.log('📡 latest-summary:', summary);
      const updates = {};
      summary.forEach((s) => {
        if (s.value !== null) {
          updates[`${s.sensorType}-latest`] = s;
        }
      });
      setLatestData((prev) => ({ ...prev, ...updates }));
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    latestData,
    socket: socketRef.current,
    connect,
    disconnect,
  };
}

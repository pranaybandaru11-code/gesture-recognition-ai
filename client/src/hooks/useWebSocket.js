import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (sessionId) => {
  const ws = useRef(null);
  const [gesture, setGesture] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `ws://localhost:8000/api/v1/ws/${sessionId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) setGesture(data);
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => ws.current?.close();
  }, [sessionId]);

  const sendFrame = useCallback((imageBase64) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ image_base64: imageBase64 }));
    }
  }, []);

  return { gesture, connected, sendFrame };
};
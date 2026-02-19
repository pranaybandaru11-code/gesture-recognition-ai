import { useEffect, useRef, useState, useCallback } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import Navbar from "../components/Navbar";

const COLORS = ["#a855f7", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const canvasVideoRef = useRef(null);
  const [sessionId] = useState(() => `draw_${Date.now()}`);
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [currentGesture, setCurrentGesture] = useState("Show hand to draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef(null);

  const { gesture, connected, sendFrame } = useWebSocket(sessionId);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (err) {
      alert("Camera access denied!");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setIsStreaming(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isStreaming && connected) {
      intervalRef.current = setInterval(() => {
        const canvas = canvasVideoRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
        sendFrame(base64);
      }, 100);
    }
    return () => clearInterval(intervalRef.current);
  }, [isStreaming, connected, sendFrame]);

  // Handle gestures for drawing
  useEffect(() => {
    if (!gesture) return;

    const g = gesture.gesture_name;
    setCurrentGesture(`${g} (${Math.round(gesture.confidence * 100)}%)`);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Get canvas dimensions
    const rect = canvas.getBoundingClientRect();

    if (g === "pointing") {
      // Draw mode - index finger position
      setIsDrawing(true);
      
      // Simulate finger position (in real app, get from MediaPipe landmarks)
      // For now, use random position as demo
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;

      if (lastPointRef.current) {
        ctx.strokeStyle = COLORS[colorIndex];
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      lastPointRef.current = { x, y };
    } else if (g === "peace") {
      // Change color
      setColorIndex((prev) => (prev + 1) % COLORS.length);
      lastPointRef.current = null;
      setIsDrawing(false);
    } else if (g === "open_hand") {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lastPointRef.current = null;
      setIsDrawing(false);
    } else if (g === "fist") {
      // Erase mode
      if (lastPointRef.current) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 30;
        ctx.lineCap = "round";
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
        lastPointRef.current = { x, y };
      }
      setIsDrawing(true);
    } else if (g === "thumbs_up") {
      // Save drawing
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `drawing_${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      lastPointRef.current = null;
      setIsDrawing(false);
    } else {
      lastPointRef.current = null;
      setIsDrawing(false);
    }
  }, [gesture, colorIndex]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-white mb-2">
            🎨 Virtual Whiteboard
          </h1>
          <p className="text-gray-400 text-lg">
            Draw in the air with your hand gestures!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full cursor-crosshair"
              />
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: COLORS[colorIndex] }}
                  />
                  <span className="text-white text-sm font-medium">
                    {isDrawing ? "Drawing..." : "Ready"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={clearCanvas}
              className="mt-4 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
            >
              🗑️ Clear Canvas
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">

            {/* Camera */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-48 object-cover bg-black"
              />
              <canvas ref={canvasVideoRef} className="hidden" />
              <div className="p-4 flex gap-2">
                <button
                  onClick={startCamera}
                  disabled={isStreaming}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 transition text-sm"
                >
                  ▶ Start
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!isStreaming}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 transition text-sm"
                >
                  ⏹ Stop
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-white text-sm font-medium">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                Gesture: <span className="text-purple-400 font-bold">{currentGesture}</span>
              </p>
            </div>

            {/* Color Palette */}
            <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">🎨 Color</h3>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setColorIndex(i)}
                    className={`w-10 h-10 rounded-lg transition ${
                      i === colorIndex ? "ring-4 ring-white scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Gesture Guide */}
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur border border-purple-500/30 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">✋ Controls</h3>
              <div className="space-y-2 text-sm">
                {[
                  { g: "👆 Point", a: "Draw" },
                  { g: "✌️ Peace", a: "Change Color" },
                  { g: "✊ Fist", a: "Erase" },
                  { g: "🖐️ Open", a: "Clear All" },
                  { g: "👍 Thumbs Up", a: "Save Image" },
                ].map((c, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-300">{c.g}</span>
                    <span className="text-purple-400 font-bold">{c.a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
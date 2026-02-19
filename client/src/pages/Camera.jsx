import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import Navbar from "../components/Navbar";
import GestureCard from "../components/GestureCard";

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef(null);

  const { gesture, connected, sendFrame } = useWebSocket(sessionId);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (err) {
      alert("Camera access denied. Please allow camera access.");
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
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
        sendFrame(base64);
      }, 200);
    }
    return () => clearInterval(intervalRef.current);
  }, [isStreaming, connected, sendFrame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-3">
            Live Gesture Detection
          </h1>
          <p className="text-gray-400 text-lg">
            Show your hand to the camera and watch AI detect your gestures in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Camera Feed */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-96 object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay indicator */}
              {isStreaming && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>
              )}

              {/* Controls */}
              <div className="p-6 flex gap-4">
                <button
                  onClick={startCamera}
                  disabled={isStreaming}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-green-500/30"
                >
                  ▶ Start Camera
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!isStreaming}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-red-500/30"
                >
                  ⏹ Stop
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Connection Status */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <div>
                  <p className="text-white font-bold">
                    {connected ? "WebSocket Connected" : "Disconnected"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {isStreaming ? "Streaming active" : "Camera inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* Gesture Result */}
            {gesture ? (
              <div className="transform hover:scale-105 transition">
                <GestureCard gesture={gesture} />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700 rounded-3xl p-12 text-center">
                <div className="text-7xl mb-4 animate-bounce">🖐️</div>
                <p className="text-gray-400 text-lg">
                  {isStreaming ? "Show your hand to detect gestures" : "Start camera to begin"}
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur border border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                💡 Quick Tips
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Keep your hand clearly visible in frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Ensure good lighting for better accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Try different gestures: fist, peace, thumbs up</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
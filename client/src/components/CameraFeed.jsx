import { useEffect, useRef, useState, useCallback } from "react";

const CameraFeed = ({ onFrame }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const intervalRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      alert("Please allow camera access!");
    }
  };

  useEffect(() => {
    if (streaming) {
      intervalRef.current = setInterval(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
        onFrame(base64);
      }, 200);
    }
    return () => clearInterval(intervalRef.current);
  }, [streaming, onFrame]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-40 object-cover bg-black"
      />
      <canvas ref={canvasRef} className="hidden" />
      {!streaming ? (
        <button
          onClick={start}
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
        >
          📷 Enable Camera
        </button>
      ) : (
        <div className="py-2 text-center text-green-400 text-sm">
          ✅ Camera Active
        </div>
      )}
    </div>
  );
};

export default CameraFeed;
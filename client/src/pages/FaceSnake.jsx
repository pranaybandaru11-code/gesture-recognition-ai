import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import CameraFeed from "../components/CameraFeed";

const GRID = 20;
const CELL = 20;
const WIDTH = GRID * CELL;
const HEIGHT = GRID * CELL;

const getFood = () => ({
  x: Math.floor(Math.random() * GRID),
  y: Math.floor(Math.random() * GRID),
});

const FaceSnake = () => {
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: getFood(),
    score: 0,
    running: false,
    speed: 150,
  });

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [faceDirection, setFaceDirection] = useState("center");
  const [mouthOpen, setMouthOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sessionId] = useState(() => `face_${Date.now()}`);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${sessionId}`);
    
    ws.onopen = () => {
      console.log("✅ Face WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Send to face detection endpoint
        const response = await fetch("/api/v1/ml/predict-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: data.image_base64 }),
        });
        
        const result = await response.json();
        
        if (result.face_detected) {
          setFaceDirection(result.direction);
          setMouthOpen(result.mouth_open);
          
          if (gameRef.current.running) {
            updateDirection(result.direction, result.mouth_open);
          }
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [sessionId]);

  const updateDirection = (direction, isOpen) => {
    const { dir } = gameRef.current;

    if (direction === "left" && dir.x !== 1) {
      gameRef.current.nextDir = { x: -1, y: 0 };
    } else if (direction === "right" && dir.x !== -1) {
      gameRef.current.nextDir = { x: 1, y: 0 };
    } else if (direction === "up" && dir.y !== 1) {
      gameRef.current.nextDir = { x: 0, y: -1 };
    } else if (direction === "down" && dir.y !== -1) {
      gameRef.current.nextDir = { x: 0, y: 1 };
    }

    // Speed boost when mouth open
    if (isOpen) {
      gameRef.current.speed = 80;
    } else {
      gameRef.current.speed = 150;
    }
  };

  const handleFrame = useCallback((base64) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ image_base64: base64 }));
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { snake, food } = gameRef.current;

    // Background
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Grid
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(WIDTH, i * CELL);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#ff4757";
    ctx.shadowColor = "#ff4757";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const ratio = 1 - i / snake.length;
      ctx.fillStyle = i === 0 ? "#10b981" : `rgba(16, 185, 129, ${0.3 + ratio * 0.7})`;
      ctx.shadowColor = i === 0 ? "#10b981" : "transparent";
      ctx.shadowBlur = i === 0 ? 15 : 0;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }, []);

  const endGame = useCallback(() => {
    gameRef.current.running = false;
    setGameOver(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    draw();

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 30);

    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`Score: ${gameRef.current.score}`, WIDTH / 2, HEIGHT / 2 + 10);
  }, [draw]);

  const gameLoop = useCallback(() => {
    if (!gameRef.current.running) return;

    const g = gameRef.current;
    g.dir = g.nextDir;

    const head = {
      x: g.snake[0].x + g.dir.x,
      y: g.snake[0].y + g.dir.y,
    };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      endGame();
      return;
    }

    if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    g.snake.unshift(head);

    if (head.x === g.food.x && head.y === g.food.y) {
      g.score += 10;
      setScore(g.score);
      g.food = getFood();
    } else {
      g.snake.pop();
    }

    draw();
    setTimeout(gameLoop, g.speed);
  }, [draw, endGame]);

  const startGame = () => {
    gameRef.current = {
      snake: [{ x: 10, y: 10 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: getFood(),
      score: 0,
      running: true,
      speed: 150,
    };
    setScore(0);
    setGameOver(false);
    setTimeout(gameLoop, 150);
  };

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-1 text-center">
          😮 Face-Controlled Snake
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Move your head to control the snake — open mouth to speed up!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Game */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              className="rounded-xl border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20"
            />
            <button
              onClick={startGame}
              className="mt-4 px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition"
            >
              {gameOver ? "🔄 Play Again" : "▶ Start Game"}
            </button>
          </div>

          {/* Side Panel */}
          <div className="flex flex-col gap-4">

            {/* Score */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-emerald-500 text-center">
              <p className="text-gray-400 text-sm mb-1">Score</p>
              <p className="text-6xl font-bold text-emerald-400">{score}</p>
            </div>

            {/* Status */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-gray-400 text-sm">
                  {connected ? "Face Tracking Active" : "Disconnected"}
                </span>
              </div>
              <p className="text-white text-sm mb-1">
                Direction: <span className="text-emerald-400 font-bold uppercase">{faceDirection}</span>
              </p>
              <p className="text-white text-sm">
                Speed: <span className={`font-bold ${mouthOpen ? "text-yellow-400" : "text-gray-400"}`}>
                  {mouthOpen ? "⚡ BOOST" : "Normal"}
                </span>
              </p>
            </div>

            {/* Camera */}
            <CameraFeed onFrame={handleFrame} />

            {/* Controls */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <h3 className="text-white font-bold mb-3">🎮 Controls</h3>
              <div className="space-y-2 text-sm">
                {[
                  { i: "👈", a: "Look Left → ←" },
                  { i: "👉", a: "Look Right → →" },
                  { i: "👆", a: "Look Up → ↑" },
                  { i: "👇", a: "Look Down → ↓" },
                  { i: "😮", a: "Open Mouth → ⚡" },
                ].map((c, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-300">{c.i} {c.a.split("→")[0]}</span>
                    <span className="text-emerald-400 font-bold">{c.a.split("→")[1]}</span>
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

export default FaceSnake;
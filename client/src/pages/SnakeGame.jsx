import { useEffect, useRef, useState, useCallback } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
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

const SnakeGame = () => {
  const canvasRef = useRef(null);
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
  const [currentGesture, setCurrentGesture] = useState("Show hand to play!");
  const [sessionId] = useState(() => `snake_${Date.now()}`);

  const { gesture, connected, sendFrame } = useWebSocket(sessionId);

  const handleFrame = useCallback((base64) => {
    sendFrame(base64);
  }, [sendFrame]);

  // Map gestures to directions
  useEffect(() => {
    if (!gesture || !gameRef.current.running) return;

    const g = gesture.gesture_name;
    setCurrentGesture(`${g} (${Math.round(gesture.confidence * 100)}%)`);

    const { dir } = gameRef.current;

    if (g === "pointing") {
      if (dir.y !== 1) gameRef.current.nextDir = { x: 0, y: -1 };
    } else if (g === "peace") {
      if (dir.y !== -1) gameRef.current.nextDir = { x: 0, y: 1 };
    } else if (g === "thumbs_up") {
      if (dir.x !== -1) gameRef.current.nextDir = { x: 1, y: 0 };
    } else if (g === "rock") {
      if (dir.x !== 1) gameRef.current.nextDir = { x: -1, y: 0 };
    } else if (g === "open_hand") {
      gameRef.current.speed = 80;
    } else if (g === "fist") {
      gameRef.current.speed = 200;
    }
  }, [gesture]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { snake, food } = gameRef.current;

    // Background
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Grid lines
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

    // Snake body
    snake.forEach((seg, i) => {
      const ratio = 1 - i / snake.length;
      ctx.fillStyle = i === 0
        ? "#a855f7"
        : `rgba(139, 92, 246, ${0.3 + ratio * 0.7})`;
      ctx.shadowColor = i === 0 ? "#a855f7" : "transparent";
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

    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 30);

    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`Score: ${gameRef.current.score}`, WIDTH / 2, HEIGHT / 2 + 10);

    ctx.fillStyle = "#6b7280";
    ctx.font = "16px Arial";
    ctx.fillText("Click Play Again to restart", WIDTH / 2, HEIGHT / 2 + 50);
  }, [draw]);

  const gameLoop = useCallback(() => {
    if (!gameRef.current.running) return;

    const g = gameRef.current;
    g.dir = g.nextDir;

    const head = {
      x: g.snake[0].x + g.dir.x,
      y: g.snake[0].y + g.dir.y,
    };

    // Wall collision
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      endGame();
      return;
    }

    // Self collision
    if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    g.snake.unshift(head);

    // Eat food
    if (head.x === g.food.x && head.y === g.food.y) {
      g.score += 10;
      setScore(g.score);
      g.food = getFood();
      if (g.speed > 60) g.speed -= 2;
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
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white mb-1 text-center">
          🐍 Gesture Snake Game
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Control the snake with your hand gestures!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Game */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              className="rounded-xl border-2 border-purple-500 shadow-2xl shadow-purple-500/20"
            />
            <button
              onClick={startGame}
              className="mt-4 px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition"
            >
              {gameOver ? "🔄 Play Again" : "▶ Start Game"}
            </button>
          </div>

          {/* Side Panel */}
          <div className="flex flex-col gap-4">

            {/* Score */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-purple-500 text-center">
              <p className="text-gray-400 text-sm mb-1">Score</p>
              <p className="text-6xl font-bold text-purple-400">{score}</p>
            </div>

            {/* Status */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-gray-400 text-sm">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-white text-sm">
                Gesture: <span className="text-purple-400 font-medium">{currentGesture}</span>
              </p>
            </div>

            {/* Camera */}
            <CameraFeed onFrame={handleFrame} />

            {/* Controls */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <h3 className="text-white font-bold mb-3">🎮 Controls</h3>
              <div className="space-y-2 text-sm">
                {[
                  { g: "👆 Pointing", a: "↑ Up" },
                  { g: "✌️ Peace", a: "↓ Down" },
                  { g: "👍 Thumbs Up", a: "→ Right" },
                  { g: "🤘 Rock", a: "← Left" },
                  { g: "🖐️ Open Hand", a: "⚡ Fast" },
                  { g: "✊ Fist", a: "🐢 Slow" },
                ].map((c, i) => (
                  <div key={i} className="flex justify-between">
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

export default SnakeGame;
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  if (token) {
    navigate("/camera");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 relative overflow-hidden">
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full">
            <span className="text-purple-300 text-sm font-medium">🤖 AI-Powered Gesture Recognition</span>
          </div>
          
          <h1 className="text-7xl font-black text-white mb-6 leading-tight">
            Control With
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Your Hands
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Real-time hand gesture detection powered by MediaPipe AI. 
            Play games, control apps, and interact naturally with just your hands.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/50 transition transform hover:scale-105"
            >
              Get Started →
            </button>
            <button
              onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-lg border border-gray-700 transition"
            >
              See Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="demo" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-3">Game Control</h3>
            <p className="text-gray-400">
              Play Snake game using hand gestures. No keyboard needed!
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-white mb-3">Real-Time</h3>
            <p className="text-gray-400">
              Instant detection with 95%+ accuracy. Response time under 100ms.
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-3">Analytics</h3>
            <p className="text-gray-400">
              Track your gestures, see patterns, and monitor performance.
            </p>
          </div>
        </div>

        {/* Gestures Showcase */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur border border-purple-500/30 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Supported Gestures
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              { emoji: "✊", name: "Fist" },
              { emoji: "👆", name: "Point" },
              { emoji: "✌️", name: "Peace" },
              { emoji: "🖐️", name: "Open" },
              { emoji: "👍", name: "Thumbs" },
              { emoji: "🤘", name: "Rock" },
            ].map((g, i) => (
              <div key={i} className="bg-gray-900/50 backdrop-blur rounded-xl p-6 text-center hover:bg-gray-800/50 transition">
                <div className="text-5xl mb-3">{g.emoji}</div>
                <div className="text-white font-medium">{g.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 mb-8">
            Create an account and start controlling with gestures in seconds.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-xl shadow-2xl shadow-purple-500/50 transition transform hover:scale-105"
          >
            Launch App →
          </button>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await loginUser(email, password);
        login(data.access_token);
        navigate("/camera");
      } else {
        await registerUser(email, username, password);
        const data = await loginUser(email, password);
        login(data.access_token);
        navigate("/camera");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-6xl">🖐️</span>
          <h1 className="text-3xl font-bold text-white mt-4">GestureAI</h1>
          <p className="text-gray-400 mt-1">Real-time gesture recognition</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition font-medium ${
              isLogin ? "bg-purple-600 text-white" : "text-gray-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition font-medium ${
              !isLogin ? "bg-purple-600 text-white" : "text-gray-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-gray-800">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <span className="text-2xl">🖐️</span>
        <span className="text-xl font-bold text-purple-400">GestureAI</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/camera")}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
        >
          📷 Detect
        </button>
        <button
          onClick={() => navigate("/whiteboard")}
          className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition font-bold"
        >
          🎨 Whiteboard
        </button>
        <button
          onClick={() => navigate("/snake")}
          className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          🐍 Snake
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          📊 Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
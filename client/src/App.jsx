import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Camera from "./pages/Camera";
import Dashboard from "./pages/Dashboard";
import SnakeGame from "./pages/SnakeGame";
import Whiteboard from "./pages/Whiteboard";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/camera" element={
            <ProtectedRoute><Camera /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/snake" element={
            <ProtectedRoute><SnakeGame /></ProtectedRoute>
          } />
          <Route path="/whiteboard" element={
            <ProtectedRoute><Whiteboard /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
import { useNavigate, useLocation } from "react-router-dom";
import "./BottomNavigation.css";

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-navigation">
      <button
        className={`nav-item ${isActive("/") ? "active" : ""}`}
        onClick={() => navigate("/map")}
      >
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">Mapa</span>
      </button>
      <button
        className={`nav-item ${isActive("/motorcycles") ? "active" : ""}`}
        onClick={() => navigate("/motorcycles")}
      >
        <span className="nav-icon">🏍️</span>
        <span className="nav-label">Motos</span>
      </button>
      <button
        className={`nav-item ${isActive("/balance") ? "active" : ""}`}
        onClick={() => navigate("/balance")}
      >
        <span className="nav-icon">💲</span>
        <span className="nav-label">Balance</span>
      </button>
    </nav>
  );
}

export default BottomNavigation;

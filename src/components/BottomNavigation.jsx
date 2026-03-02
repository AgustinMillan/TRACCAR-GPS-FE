import "./BottomNavigation.css";

function BottomNavigation({ activeView, onViewChange }) {
  return (
    <nav className="bottom-navigation">
      <button
        className={`nav-item ${activeView === "map" ? "active" : ""}`}
        onClick={() => onViewChange("map")}
      >
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">Mapa</span>
      </button>
      <button
        className={`nav-item ${activeView === "motorcycles" ? "active" : ""}`}
        onClick={() => onViewChange("motorcycles")}
      >
        <span className="nav-icon">🏍️</span>
        <span className="nav-label">Motos</span>
      </button>
      <button
        className={`nav-item ${activeView === "balance" ? "active" : ""}`}
        onClick={() => onViewChange("balance")}
      >
        <span className="nav-icon">💲</span>
        <span className="nav-label">Balance</span>
      </button>
    </nav>
  );
}

export default BottomNavigation;

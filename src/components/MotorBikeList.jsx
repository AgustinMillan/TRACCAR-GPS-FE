import "./MotorBikeList.css";

function MotorBikeList({ motorBikes, onEdit, onCalendar, loading }) {
  if (loading) {
    return (
      <div className="motor-bike-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando motos...</p>
      </div>
    );
  }

  if (!motorBikes || motorBikes.length === 0) {
    return (
      <div className="motor-bike-list-empty">
        <span className="empty-icon">🏍️</span>
        <p>No hay motos registradas</p>
        <p className="empty-subtitle">
          Agrega tu primera moto usando el botón +
        </p>
      </div>
    );
  }

  return (
    <div className="motor-bike-list">
      {motorBikes.map((moto) => (
        <div
          key={moto.id}
          className={`motor-bike-item ${!moto.isActive ? "inactive" : ""}`}
        >
          <div className="motor-bike-item-content">
            <div className="motor-bike-info">
              <h3 className="motor-bike-name">{moto.name}</h3>
              {moto.trackingToken && (
                <p className="motor-bike-token">
                  Token: {moto.trackingToken.substring(0, 20)}...
                </p>
              )}
            </div>
            <div className="motor-bike-status">
              <span
                className={`status-badge ${moto.isActive ? "active" : "inactive"}`}
              >
                {moto.isActive ? "Activa" : "Inactiva"}
              </span>
              <button className="edit-icon" onClick={() => onEdit(moto)}>
                ✏️
              </button>
              <button onClick={() => onCalendar(moto)}>📆</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MotorBikeList;

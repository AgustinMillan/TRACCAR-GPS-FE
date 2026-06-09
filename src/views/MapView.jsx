import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllMotorBikes } from "../services/motorBikeService";
import { getMotorBikePosition } from "../services/traccarService";
import "./MapView.css";

// Coordenadas de San Miguel de Tucumán, Argentina
const SAN_MIGUEL_TUCUMAN = [-26.8083, -65.2176];

// Configurar el icono por defecto de Leaflet (necesario para react-leaflet)
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Icono personalizado para motos
const createMotorBikeIcon = () => {
  return new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function MapView() {
  const [motorBikes, setMotorBikes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBikeIds, setSelectedBikeIds] = useState([]);
  
  const motorBikesRef = useRef([]);
  const selectedBikeIdsRef = useRef([]);

  // Mantener una referencia actualizada de motorBikes y selectedBikeIds para que el intervalo
  // lea siempre el estado más reciente (evita el problema del closure)
  useEffect(() => {
    motorBikesRef.current = motorBikes;
  }, [motorBikes]);

  useEffect(() => {
    selectedBikeIdsRef.current = selectedBikeIds;
  }, [selectedBikeIds]);

  // Cargar motos y posiciones
  useEffect(() => {
    loadMotorBikesAndPositions();

    // Actualizar posiciones cada 10 segundos
    const interval = setInterval(() => {
      const bikeIds = selectedBikeIdsRef.current;
      if (bikeIds.length > 0) {
        loadPositionsProgressively(bikeIds);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Carga progresiva de posiciones: actualiza el mapa a medida que cada moto responde
  const loadPositionsProgressively = async (bikeIds) => {
    if (bikeIds.length === 0) {
      setLoading(false);
      return;
    }

    let loadedAny = false;
    let settledCount = 0;

    bikeIds.forEach(async (id) => {
      try {
        const pos = await getMotorBikePosition(id);
        if (
          pos &&
          typeof pos.latitude === "number" &&
          !isNaN(pos.latitude) &&
          typeof pos.longitude === "number" &&
          !isNaN(pos.longitude)
        ) {
          setPositions((prev) => {
            const filtered = prev.filter((p) => p.id !== id);
            return [...filtered, { id, ...pos }];
          });
          loadedAny = true;
          setLoading(false); // Ocultar spinner tan pronto como cargue al menos una moto
        }
      } catch (err) {
        console.error(`Error al obtener posición de moto ${id}:`, err);
      } finally {
        settledCount++;
        if (settledCount === bikeIds.length) {
          if (!loadedAny) {
            setLoading(false); // Si todas terminan de cargar y ninguna funcionó, ocultar spinner igualmente
          }
        }
      }
    });
  };

  const loadMotorBikesAndPositions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todas las motos
      const bikes = await getAllMotorBikes();
      setMotorBikes(bikes);

      // Obtener posiciones de motos activas
      const activeBikes = bikes.filter((bike) => bike.isActive);
      const activeBikeIds = activeBikes.map((bike) => bike.id);
      setSelectedBikeIds(activeBikeIds); // Todas marcadas por defecto

      if (activeBikeIds.length > 0) {
        await loadPositionsProgressively(activeBikeIds);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error al cargar motos y posiciones:", err);
      setError(err.message || "Error al cargar las motos");
      setLoading(false);
    }
  };

  // Obtener información de la moto por ID
  const getMotorBikeInfo = (id) => {
    return motorBikes.find((bike) => bike.id === id);
  };

  // Formatear velocidad
  const formatSpeed = (speed) => {
    const speedKmh = (speed * 3.6).toFixed(1);
    return `${speedKmh} km/h`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleToggleBike = (bikeId) => {
    setSelectedBikeIds((prev) => {
      const isSelected = prev.includes(bikeId);
      const newSelected = isSelected
        ? prev.filter((id) => id !== bikeId)
        : [...prev, bikeId];
      
      // Si se acaba de seleccionar, intentar cargar inmediatamente su posición
      if (!isSelected) {
        loadPositionsProgressively([bikeId]);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const activeBikeIds = motorBikes
      .filter((bike) => bike.isActive)
      .map((bike) => bike.id);
    setSelectedBikeIds(activeBikeIds);
    loadPositionsProgressively(activeBikeIds);
  };

  const handleSelectNone = () => {
    setSelectedBikeIds([]);
  };

  const activeBikes = motorBikes.filter((bike) => bike.isActive);

  return (
    <div className="map-view">
      {error && (
        <div className="map-error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      {loading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Cargando mapa...</p>
        </div>
      )}

      {/* Panel flotante de filtros */}
      {activeBikes.length > 0 && (
        <div className="map-filter-panel">
          <h3 className="filter-title">🛵 Motos Activas</h3>
          <div className="filter-actions">
            <button className="btn-filter-action" onClick={handleSelectAll}>
              Marcar todas
            </button>
            <button className="btn-filter-action" onClick={handleSelectNone}>
              Desmarcar
            </button>
          </div>
          <div className="filter-list">
            {activeBikes.map((bike) => {
              const isSelected = selectedBikeIds.includes(bike.id);
              return (
                <label key={bike.id} className="filter-item">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleBike(bike.id)}
                  />
                  <span className="bike-name-text">{bike.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <MapContainer
        center={SAN_MIGUEL_TUCUMAN}
        zoom={13}
        scrollWheelZoom={true}
        className="map-container-leaflet"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores de las motos */}
        {positions
          .filter(
            (pos) =>
              pos &&
              selectedBikeIds.includes(pos.id) &&
              typeof pos.latitude === "number" &&
              !isNaN(pos.latitude) &&
              typeof pos.longitude === "number" &&
              !isNaN(pos.longitude)
          )
          .map((position) => {
            const bike = getMotorBikeInfo(position.id);
            if (!bike) return null;

            return (
              <Marker
                key={position.id}
                position={[position.latitude, position.longitude]}
                icon={createMotorBikeIcon()}
              >
                <Popup>
                  <div className="motor-bike-popup">
                    <strong>{bike.name}</strong>
                    <br />
                    <span className="popup-info">
                      Velocidad: {formatSpeed(position.speed)}
                    </span>
                    <span className="popup-info">
                      Fecha: {formatDate(position.date)}
                    </span>
                    <span className="popup-info">
                      Telefono GPS: {bike.phoneNumber || "N/A"}
                    </span>
                    <span className="popup-info">
                      Compania GPS: {bike.phoneCompany || "N/A"}
                    </span>
                    {bike.trackingToken && (
                      <>
                        <br />
                        <span className="popup-info">
                          Token: {bike.trackingToken.substring(0, 15)}...
                        </span>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

export default MapView;

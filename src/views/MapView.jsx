import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllMotorBikes } from "../services/motorBikeService";
import { getMultipleMotorBikePositions } from "../services/traccarService";
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
  const motorBikesRef = useRef([]);

  // Cargar motos y posiciones
  useEffect(() => {
    loadMotorBikesAndPositions();

    // Actualizar posiciones cada 10 segundos (leer estado más reciente desde ref)
    const interval = setInterval(() => {
      (async () => {
        try {
          const activeBikes = motorBikesRef.current.filter(
            (bike) => bike.isActive,
          );
          if (activeBikes.length > 0) {
            const bikeIds = activeBikes.map((bike) => bike.id);

            const bikePositions = await getMultipleMotorBikePositions(bikeIds);
            bikePositions.forEach((pos, index) => {
              if (!pos.latitude || !pos.longitude) {
                bikePositions.splice(index, 1); // Eliminar posición inválida del array
              }
            });
            setPositions(bikePositions);
          }
        } catch (err) {
          console.error("Error al actualizar posiciones:", err);
        }
      })();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Mantener una referencia actualizada de motorBikes para que el intervalo
  // lea siempre el estado más reciente (evita el problema del closure)
  useEffect(() => {
    motorBikesRef.current = motorBikes;
  }, [motorBikes]);

  const loadMotorBikesAndPositions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todas las motos
      const bikes = await getAllMotorBikes();
      setMotorBikes(bikes);

      // Obtener posiciones de motos activas
      const activeBikes = bikes.filter((bike) => bike.isActive);
      if (activeBikes.length > 0) {
        const bikeIds = activeBikes.map((bike) => bike.id);
        const bikePositions = await getMultipleMotorBikePositions(bikeIds);
        bikePositions.forEach((pos, index) => {
          if (!pos.latitude || !pos.longitude) {
            alert(
              `La moto con ID ${pos.id} tiene datos de posición inválidos. Verifique el dispositivo GPS.`,
            );
            bikePositions.splice(index, 1); // Eliminar posición inválida del array
          }
        });
        setPositions(bikePositions);
      }
    } catch (err) {
      console.error("Error al cargar motos y posiciones:", err);
      setError(err.message || "Error al cargar las motos");
    } finally {
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
        {positions.map((position) => {
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

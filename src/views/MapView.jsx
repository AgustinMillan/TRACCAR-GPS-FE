import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllMotorBikes } from "../services/motorBikeService";
import { getMotorBikePosition } from "../services/traccarService";

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
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  });
};

function MapView() {
  const [motorBikes, setMotorBikes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBikeIds, setSelectedBikeIds] = useState([]);
  const [panelOpen, setPanelOpen] = useState(true);

  const motorBikesRef = useRef([]);
  const selectedBikeIdsRef = useRef([]);

  useEffect(() => {
    motorBikesRef.current = motorBikes;
  }, [motorBikes]);

  useEffect(() => {
    selectedBikeIdsRef.current = selectedBikeIds;
  }, [selectedBikeIds]);

  useEffect(() => {
    loadMotorBikesAndPositions();
    const interval = setInterval(() => {
      const bikeIds = selectedBikeIdsRef.current;
      if (bikeIds.length > 0) {
        loadPositionsProgressively(bikeIds);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error al obtener posición de moto ${id}:`, err);
      } finally {
        settledCount++;
        if (settledCount === bikeIds.length && !loadedAny) {
          setLoading(false);
        }
      }
    });
  };

  const loadMotorBikesAndPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const bikes = await getAllMotorBikes();
      setMotorBikes(bikes);
      const activeBikes = bikes.filter((bike) => bike.isActive);
      const activeBikeIds = activeBikes.map((bike) => bike.id);
      setSelectedBikeIds(activeBikeIds);
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

  const getMotorBikeInfo = (id) => motorBikes.find((bike) => bike.id === id);

  const formatSpeed = (speed) => `${(speed * 3.6).toFixed(1)} km/h`;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const handleToggleBike = (bikeId) => {
    setSelectedBikeIds((prev) => {
      const isSelected = prev.includes(bikeId);
      const newSelected = isSelected
        ? prev.filter((id) => id !== bikeId)
        : [...prev, bikeId];
      if (!isSelected) loadPositionsProgressively([bikeId]);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const activeBikeIds = motorBikes.filter((bike) => bike.isActive).map((bike) => bike.id);
    setSelectedBikeIds(activeBikeIds);
    loadPositionsProgressively(activeBikeIds);
  };

  const handleSelectNone = () => setSelectedBikeIds([]);

  const activeBikes = motorBikes.filter((bike) => bike.isActive);

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ minHeight: "calc(100dvh - 52px - calc(72px + env(safe-area-inset-bottom)))" }}
    >
      {/* Map fills the entire space */}
      <MapContainer
        center={SAN_MIGUEL_TUCUMAN}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
                  <div>
                    <strong style={{ display: "block", marginBottom: "6px", fontSize: "14px", color: "#fafafa", fontWeight: 600 }}>
                      {bike.displayName || bike.name}
                    </strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {[
                        ["Velocidad", formatSpeed(position.speed)],
                        ["Última señal", formatDate(position.date)],
                        ["Teléfono GPS", bike.phoneNumber || "N/A"],
                        ["Compañía", bike.phoneCompany || "N/A"],
                        bike.trackingToken && ["Token", `${bike.trackingToken.substring(0, 12)}...`],
                      ].filter(Boolean).map(([key, val]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                          <span style={{ fontSize: "11px", color: "#a1a1aa" }}>{key}</span>
                          <span style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: 500 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Overlays — above map */}

      {/* Error toast */}
      {error && (
        <div
          className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#fca5a5] animate-fade-in"
          style={{
            background: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" className="shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer border-none bg-transparent p-0 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-3 px-6 py-5 rounded-2xl animate-fade-in"
          style={{
            background: "rgba(24, 24, 27, 0.95)",
            border: "1px solid #27272a",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-[#27272a] border-t-[#6366f1]"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="m-0 text-[14px] font-medium text-[#a1a1aa]">Cargando mapa...</p>
        </div>
      )}

      {/* Filter panel toggle button */}
      {activeBikes.length > 0 && (
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-3 right-3 z-[1000] w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer border-none transition-all duration-200"
          style={{
            background: panelOpen ? "#6366f1" : "rgba(24, 24, 27, 0.95)",
            border: panelOpen ? "1px solid #6366f1" : "1px solid #27272a",
            backdropFilter: "blur(12px)",
            color: panelOpen ? "white" : "#a1a1aa",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
          title="Filtrar motos"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
          </svg>
        </button>
      )}

      {/* Filter panel */}
      {activeBikes.length > 0 && panelOpen && (
        <div
          className="absolute top-14 right-3 z-[1000] w-[240px] max-h-[calc(100%-80px)] overflow-y-auto rounded-2xl animate-slide-in-right"
          style={{
            background: "rgba(18, 18, 20, 0.97)",
            border: "1px solid #27272a",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#27272a]">
            <p className="m-0 text-[14px] font-semibold text-[#fafafa] uppercase tracking-wider">
              Motos activas
            </p>
            <p className="m-0 text-[14px] text-[#a1a1aa] mt-0.5">
              {selectedBikeIds.length} de {activeBikes.length} visible{selectedBikeIds.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2.5 flex gap-2 border-b border-[#27272a]">
            <button
              onClick={handleSelectAll}
              className="flex-1 py-1.5 px-2 rounded-lg text-[14px] font-medium text-[#a1a1aa] hover:text-[#fafafa] bg-[#27272a] hover:bg-[#71717a] cursor-pointer border-none transition-all duration-150"
            >
              Todas
            </button>
            <button
              onClick={handleSelectNone}
              className="flex-1 py-1.5 px-2 rounded-lg text-[14px] font-medium text-[#a1a1aa] hover:text-[#fafafa] bg-[#27272a] hover:bg-[#71717a] cursor-pointer border-none transition-all duration-150"
            >
              Ninguna
            </button>
          </div>

          {/* Bike list */}
          <div className="p-2">
            {activeBikes.map((bike) => {
              const isSelected = selectedBikeIds.includes(bike.id);
              return (
                <label
                  key={bike.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#27272a] select-none"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isSelected ? "bg-[#6366f1]" : "bg-[#27272a] border border-[#71717a]"
                    }`}
                  >
                    {isSelected && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleBike(bike.id)}
                    className="sr-only"
                  />
                  <span className={`text-[14px] font-medium transition-colors ${isSelected ? "text-[#fafafa]" : "text-[#a1a1aa]"}`}>
                    {bike.displayName || bike.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;

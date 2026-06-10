import { useState, useEffect } from "react";
import MotorBikeList from "../components/MotorBikeList";
import MotorBikeForm from "../components/MotorBikeForm";
import {
  getAllMotorBikes,
  createMotorBike,
  updateMotorBike,
} from "../services/motorBikeService";
import CalendarioPagos from "../components/Calendar";

function MotorBikeManagement() {
  const [motorBikes, setMotorBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMotorBike, setEditingMotorBike] = useState(null);
  const [calandarMotorBike, setCalendarMotorBike] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMotorBikes();
  }, []);

  const loadMotorBikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMotorBikes();
      setMotorBikes(data);
    } catch (err) {
      console.error("Error al cargar motos:", err);
      setError(err.message || "Error al cargar las motos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingMotorBike(null);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (motorBike) => {
    setEditingMotorBike(motorBike);
    setShowForm(true);
    setError(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMotorBike(null);
    setError(null);
  };

  const handleCalendar = (motorBike) => {
    setCalendarMotorBike(motorBike);
    setShowCalendar(true);
  };

  const handleSave = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingMotorBike) {
        await updateMotorBike(editingMotorBike.id, formData);
      } else {
        await createMotorBike(formData);
      }

      await loadMotorBikes();
      handleCloseForm();
    } catch (err) {
      console.error("Error al guardar moto:", err);
      setError(err.message || "Error al guardar la moto");
    } finally {
      setFormLoading(false);
    }
  };

  const activeCount = motorBikes.filter((m) => m.isActive).length;
  const totalCount = motorBikes.length;

  return (
    <div className="w-full min-h-full flex flex-col bg-[#09090b]">
      {/* Page header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#18181b]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold text-[#fafafa] m-0 mb-1 tracking-tight">Motos</h1>
            {!loading && (
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#a1a1aa]">
                  {totalCount === 0 ? "Sin unidades" : `${totalCount} unidad${totalCount !== 1 ? "es" : ""}`}
                </span>
                {activeCount > 0 && (
                  <span className="text-[14px] font-medium bg-[#22c55e15] text-[#22c55e] px-2 py-0.5 rounded-full border border-[#22c55e20]">
                    {activeCount} activa{activeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* FAB */}
          <button
            onClick={handleAddNew}
            aria-label="Agregar nueva moto"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white cursor-pointer border-none transition-all duration-200 active:scale-95 shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Nueva
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#fca5a5] animate-fade-in"
          style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#ef4444]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-[#ef4444] opacity-60 hover:opacity-100 transition-opacity cursor-pointer border-none bg-transparent p-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 px-4 py-4">
        <MotorBikeList
          motorBikes={motorBikes}
          onEdit={handleEdit}
          onCalendar={handleCalendar}
          loading={loading}
        />
      </div>

      {showForm && (
        <MotorBikeForm
          motorBike={editingMotorBike}
          onSave={handleSave}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      )}

      {showCalendar && (
        <CalendarioPagos
          onClose={() => {
            setShowCalendar(false);
            setCalendarMotorBike(null);
          }}
          motorBike={calandarMotorBike}
        />
      )}
    </div>
  );
}

export default MotorBikeManagement;

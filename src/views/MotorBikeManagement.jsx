import { useState, useEffect } from "react";
import MotorBikeList from "../components/MotorBikeList";
import MotorBikeForm from "../components/MotorBikeForm";
import {
  getAllMotorBikes,
  createMotorBike,
  updateMotorBike,
} from "../services/motorBikeService";
import "./MotorBikeManagement.css";
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
        // Actualizar moto existente
        await updateMotorBike(editingMotorBike.id, formData);
      } else {
        // Crear nueva moto
        await createMotorBike(formData);
      }

      // Recargar la lista
      await loadMotorBikes();
      handleCloseForm();
    } catch (err) {
      console.error("Error al guardar moto:", err);
      setError(err.message || "Error al guardar la moto");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="motorcycle-management">
      <div className="management-container">
        <div className="management-header">
          <div>
            <h2>Gestión de Motos</h2>
            <p>Administra las motos y su información</p>
          </div>
          <button
            className="add-button"
            onClick={handleAddNew}
            aria-label="Agregar nueva moto"
          >
            <span className="add-icon">+</span>
          </button>
        </div>

        {error && (
          <div className="error-banner">
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

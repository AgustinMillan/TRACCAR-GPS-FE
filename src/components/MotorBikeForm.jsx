import { useState, useEffect } from "react";
import "./MotorBikeForm.css";

function MotorBikeForm({ motorBike, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    trackingToken: "",
    phoneNumber: "",
    phoneCompany: "",
    gpsType: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (motorBike) {
      setFormData({
        name: motorBike.name || "",
        trackingToken: motorBike.trackingToken || "",
        isActive: motorBike.isActive !== undefined ? motorBike.isActive : true,
        phoneNumber: motorBike.phoneNumber || "",
        phoneCompany: motorBike.phoneCompany || "",
        gpsType: motorBike.gpsType || "TRACCAR",
      });
    } else {
      setFormData({
        name: "",
        trackingToken: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [motorBike]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="motor-bike-form-overlay" onClick={onCancel}>
      <div
        className="motor-bike-form-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="motor-bike-form-header">
          <h2>{motorBike ? "Editar Moto" : "Nueva Moto"}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="motor-bike-form">
          <div className="form-group">
            <label htmlFor="name">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Moto 001"
              className={errors.name ? "error" : ""}
              disabled={loading}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="trackingToken">Token de Seguimiento</label>
            <input
              type="text"
              id="trackingToken"
              name="trackingToken"
              value={formData.trackingToken}
              onChange={handleChange}
              placeholder="Token de Traccar (opcional)"
              disabled={loading}
            />
            <span className="form-hint">
              Token de seguimiento de Traccar (opcional)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Numero de telefono</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Numero de telefono GPS"
              disabled={loading}
            />
            <span className="form-hint">
              Numero de telefono del dispositivo GPS
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="phoneCompany">Compania de telefono</label>
            <input
              type="text"
              id="phoneCompany"
              name="phoneCompany"
              value={formData.phoneCompany}
              onChange={handleChange}
              placeholder="Claro, Movistar, etc."
              disabled={loading}
            />
            <span className="form-hint">
              Compania de telefono del dispositivo GPS
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="gpsType">Tipo de GPS</label>
            <select
              type="text"
              id="gpsType"
              name="gpsType"
              value={formData.gpsType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="TRACCAR">TRACCAR</option>
              <option value="DAGPS">DAGPS</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Moto activa</span>
            </label>
            <span className="form-hint">
              Las motos inactivas no aparecerán en el mapa
            </span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Guardando..." : motorBike ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MotorBikeForm;

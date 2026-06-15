import { useState, useEffect } from "react";
import { uploadFile } from "../services/fileService";

const inputClass = `
  w-full px-3.5 py-2.5 rounded-lg text-[14px] text-[#fafafa] 
  placeholder:text-[#71717a] transition-all duration-200 outline-none
  bg-[#09090b] border border-[#71717a]
  focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
  disabled:opacity-40 disabled:cursor-not-allowed
`;

const labelClass = "block mb-1.5 text-[14px] font-semibold text-[#a1a1aa] uppercase tracking-wider";

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <label className="toggle-switch cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

function FileUploader({ label, value, onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const data = await uploadFile(file);
      onChange(data.url);
    } catch (err) {
      setError(err.message || "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="flex items-center gap-2">
            <a href={import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL + value : `http://localhost:3000${value}`} target="_blank" rel="noreferrer" className="text-[#6366f1] text-sm hover:underline truncate max-w-[200px]">
              Ver archivo actual
            </a>
            <button type="button" onClick={() => onChange("")} className="text-xs text-[#ef4444] hover:underline bg-transparent border-none cursor-pointer p-0">
              Quitar
            </button>
          </div>
        ) : null}
        
        <input 
          type="file" 
          onChange={handleFileChange} 
          disabled={disabled || uploading}
          className="text-sm text-[#a1a1aa] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#6366f120] file:text-[#818cf8] hover:file:bg-[#6366f130]"
        />
        {uploading && <span className="text-xs text-[#a1a1aa]">Subiendo...</span>}
        {error && <span className="text-xs text-[#ef4444]">{error}</span>}
      </div>
    </div>
  );
}

function ClientForm({ client, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    dni: "",
    driverLicense: "",
    serviceBill: "",
    observations: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        phoneNumber: client.phoneNumber || "",
        dni: client.dni || "",
        driverLicense: client.driverLicense || "",
        serviceBill: client.serviceBill || "",
        observations: client.observations || "",
        isActive: client.isActive !== undefined ? client.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        phoneNumber: "",
        dni: "",
        driverLicense: "",
        serviceBill: "",
        observations: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [client]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full self-center mx-5 sm:max-w-[480px] max-h-[92dvh] overflow-y-auto animate-slide-up rounded-2xl"
        style={{
          background: "#18181b",
          border: "1px solid #27272a",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] sticky top-0 bg-[#18181b] z-10 rounded-t-2xl sm:rounded-t-2xl">
          <div>
            <h2 className="m-0 text-[16px] font-semibold text-[#fafafa]">
              {client ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>
            <p className="m-0 text-[14px] text-[#a1a1aa]">
              {client ? "Modifica los datos del cliente" : "Completa los datos para registrar"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all duration-200 cursor-pointer border-none bg-transparent disabled:opacity-40"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-[14px] font-semibold text-[#6366f1] uppercase tracking-wider mb-3 m-0">
              Información básica
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Nombre <span className="text-[#ef4444] normal-case tracking-normal">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Agustin Millan"
                  disabled={loading}
                  className={`${inputClass} ${errors.name ? "border-[#ef4444] focus:border-[#ef4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                />
                {errors.name && (
                  <p className="text-[14px] text-[#ef4444] mt-1 m-0 flex items-center gap-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phoneNumber" className={labelClass}>Teléfono</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Ej: +5491100002222"
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#27272a]" />

          <div>
            <p className="text-[14px] font-semibold text-[#6366f1] uppercase tracking-wider mb-3 m-0">
              Documentos
            </p>
            <div className="flex flex-col gap-4">
              <FileUploader 
                label="DNI" 
                value={formData.dni} 
                onChange={(url) => setFormData(prev => ({ ...prev, dni: url }))} 
                disabled={loading} 
              />
              <FileUploader 
                label="Licencia de Conducir" 
                value={formData.driverLicense} 
                onChange={(url) => setFormData(prev => ({ ...prev, driverLicense: url }))} 
                disabled={loading} 
              />
              <FileUploader 
                label="Factura de Servicio" 
                value={formData.serviceBill} 
                onChange={(url) => setFormData(prev => ({ ...prev, serviceBill: url }))} 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="h-px bg-[#27272a]" />
          
          <div>
            <label htmlFor="observations" className={labelClass}>Observaciones</label>
            <textarea
              id="observations"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Notas adicionales..."
              disabled={loading}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="h-px bg-[#27272a]" />

          <div>
            <p className="text-[14px] font-semibold text-[#6366f1] uppercase tracking-wider mb-3 m-0">Estado</p>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#09090b", border: "1px solid #27272a" }}>
              <div>
                <p className="m-0 text-[14px] font-medium text-[#fafafa]">Cliente activo</p>
              </div>
              <ToggleSwitch
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1 pb-safe">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-[#a1a1aa] cursor-pointer transition-all duration-200 border-none bg-[#27272a] hover:bg-[#71717a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer transition-all duration-200 border-none flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: loading ? "none" : "0 4px 16px rgba(99, 102, 241, 0.3)",
              }}
            >
              {loading ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientForm;

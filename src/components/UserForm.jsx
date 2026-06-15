import { useState, useEffect } from "react";

const inputClass = `
  w-full px-3.5 py-2.5 rounded-lg text-[14px] text-[#fafafa] 
  placeholder:text-[#71717a] transition-all duration-200 outline-none
  bg-[#09090b] border border-[#71717a]
  focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
  disabled:opacity-40 disabled:cursor-not-allowed
`;

const selectClass = `
  w-full px-3.5 py-2.5 rounded-lg text-[14px] text-[#fafafa] 
  transition-all duration-200 outline-none
  bg-[#09090b] border border-[#71717a]
  focus:border-[#6366f1] cursor-pointer
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

function UserForm({ user, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    phoneNumber: "",
    role: "SUPP",
    companyDebt: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        password: "", // empty for edit
        phoneNumber: user.phoneNumber || "",
        role: user.role || "SUPP",
        companyDebt: user.companyDebt || 0,
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        phoneNumber: "",
        role: "SUPP",
        companyDebt: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [user]);

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
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es requerido";
    if (!user && !formData.password) newErrors.password = "La contraseña es requerida para nuevos usuarios";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
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
              {user ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <p className="m-0 text-[14px] text-[#a1a1aa]">
              {user ? "Modifica los datos del usuario" : "Completa los datos para registrar"}
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
                  placeholder="Ej: Juan Pérez"
                  disabled={loading}
                  className={`${inputClass} ${errors.name ? "border-[#ef4444]" : ""}`}
                />
                {errors.name && <p className="text-[14px] text-[#ef4444] mt-1 m-0">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="username" className={labelClass}>
                  Usuario <span className="text-[#ef4444] normal-case tracking-normal">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ej: juanp"
                  disabled={loading}
                  className={`${inputClass} ${errors.username ? "border-[#ef4444]" : ""}`}
                />
                {errors.username && <p className="text-[14px] text-[#ef4444] mt-1 m-0">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Contraseña {user ? <span className="text-[12px] normal-case tracking-normal">(Dejar en blanco para no cambiar)</span> : <span className="text-[#ef4444] normal-case tracking-normal">*</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  disabled={loading}
                  className={`${inputClass} ${errors.password ? "border-[#ef4444]" : ""}`}
                />
                {errors.password && <p className="text-[14px] text-[#ef4444] mt-1 m-0">{errors.password}</p>}
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
              Rol y Finanzas
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="role" className={labelClass}>Rol</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className={selectClass}
                >
                  <option value="ADMIN">Administrador (ADMIN)</option>
                  <option value="SUPP">Soporte (SUPP)</option>
                </select>
              </div>

              {formData.role === "ADMIN" && (
                <div>
                  <label htmlFor="companyDebt" className={labelClass}>{formData.companyDebt > 0 ? "Deuda" : "Adelanto"} con la Empresa</label>
                  <input
                    type="number"
                    id="companyDebt"
                    name="companyDebt"
                    value={formData.companyDebt}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-[#27272a]" />

          <div>
            <p className="text-[14px] font-semibold text-[#6366f1] uppercase tracking-wider mb-3 m-0">Estado</p>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#09090b", border: "1px solid #27272a" }}>
              <div>
                <p className="m-0 text-[14px] font-medium text-[#fafafa]">Usuario activo</p>
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
              {loading ? "Guardando..." : user ? "Actualizar" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;

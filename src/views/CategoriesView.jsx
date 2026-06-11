import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
} from "../services/categoryService";

function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: "", isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError(err.message || "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentCategory({ id: null, name: "", isActive: true });
    setShowModal(true);
  };

  const handleOpenEditModal = (category) => {
    setIsEditing(true);
    setCurrentCategory({ id: category.id, name: category.name, isActive: category.isActive });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentCategory.name.trim()) {
      alert("El nombre de la categoría es obligatorio");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateCategory(currentCategory.id, {
          name: currentCategory.name.trim(),
          isActive: currentCategory.isActive,
        });
      } else {
        await createCategory({
          name: currentCategory.name.trim(),
          isActive: currentCategory.isActive,
        });
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      alert(err.message || "Error al guardar la categoría");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="w-full min-h-full bg-[#09090b] flex flex-col">
      {/* Page header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#18181b]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-[#fafafa] m-0 mb-1 tracking-tight">Categorías</h1>
            {!loading && categories.length > 0 && (
              <span className="text-[14px] text-[#a1a1aa]">
                {categories.length} categoría{categories.length !== 1 ? "s" : ""} · {activeCount} activa{activeCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={handleOpenCreateModal}
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

      {/* Error */}
      {error && (
        <div
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#fca5a5]"
          style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" className="shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          /* Skeletons */
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#18181b] rounded-xl h-16 animate-pulse-soft border border-[#27272a]">
                <div className="flex items-center gap-3 px-4 h-full">
                  <div className="skeleton w-5 h-5 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton h-3.5 w-1/3 rounded mb-1.5" />
                    <div className="skeleton h-2.5 w-1/5 rounded" />
                  </div>
                  <div className="skeleton h-7 w-14 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[15px] font-medium text-[#a1a1aa] m-0 mb-1">Sin categorías</p>
            <p className="text-[14px] text-[#a1a1aa] m-0 mb-5">Crea categorías para organizar tus gastos</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white cursor-pointer border-none transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
            >
              Crear primera categoría
            </button>
          </div>
        ) : (
          /* List */
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-[#18181b] rounded-xl border border-[#27272a] hover:border-[#71717a] transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${category.isActive ? "bg-[#22c55e]" : "bg-[#71717a]"}`}
                    style={category.isActive ? { boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)" } : {}}
                  />

                  {/* Name + status */}
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[14px] font-medium text-[#fafafa] truncate">{category.name}</p>
                    <p className={`m-0 text-[14px] ${category.isActive ? "text-[#22c55e]" : "text-[#a1a1aa]"}`}>
                      {category.isActive ? "Activa" : "Inactiva"}
                    </p>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEditModal(category)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-all duration-150 cursor-pointer border-none bg-transparent"
                    title="Editar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={handleCloseModal}
        >
          <div
            className="w-full self-center mx-5 sm:max-w-[420px] animate-slide-up rounded-2xl"
            style={{ background: "#18181b", border: "1px solid #27272a", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
              <h3 className="m-0 text-[15px] font-semibold text-[#fafafa]">
                {isEditing ? "Editar categoría" : "Nueva categoría"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all cursor-pointer border-none bg-transparent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              {/* Name input */}
              <div>
                <label className="block mb-1.5 text-[14px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Nombre
                </label>
                <input
                  type="text"
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  placeholder="Ej: Combustible, Mantenimiento..."
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg text-[14px] text-[#fafafa] placeholder:text-[#71717a] transition-all duration-200 outline-none bg-[#09090b] border border-[#71717a] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                />
              </div>

              {/* Active toggle (edit only) */}
              {isEditing && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: "#09090b", border: "1px solid #27272a" }}
                >
                  <div>
                    <p className="m-0 text-[14px] font-medium text-[#fafafa]">Categoría activa</p>
                  </div>
                  <label className="toggle-switch cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentCategory.isActive}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, isActive: e.target.checked })}
                    />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold text-[#a1a1aa] cursor-pointer border-none bg-[#27272a] hover:bg-[#71717a] transition-all duration-200 disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold text-white cursor-pointer border-none transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" opacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Guardando...
                    </>
                  ) : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesView;

import { useState, useEffect } from "react";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import {
  getAllUsers,
  createUser,
  updateUser,
  getUserById
} from "../services/userService";

function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setShowForm(true);
    setError(null);
  };

  const handleEdit = async (userSimplified) => {
    try {
      setLoading(true);
      setError(null);
      const fullUser = await getUserById(userSimplified.id);
      setEditingUser(fullUser);
      setShowForm(true);
    } catch (err) {
      console.error("Error al obtener detalle del usuario:", err);
      setError(err.message || "Error al obtener el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setError(null);
  };

  const handleSave = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      // Clean up empty password if editing
      const dataToSave = { ...formData };
      if (editingUser && !dataToSave.password) {
        delete dataToSave.password;
      }
      
      if (editingUser) {
        await updateUser(editingUser.id, dataToSave);
      } else {
        await createUser(dataToSave);
      }

      await loadUsers();
      handleCloseForm();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError(err.message || "Error al guardar el usuario");
    } finally {
      setFormLoading(false);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const totalCount = users.length;

  return (
    <div className="w-full min-h-full flex flex-col bg-[#09090b]">
      {/* Page header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#18181b]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold text-[#fafafa] m-0 mb-1 tracking-tight">Usuarios</h1>
            {!loading && (
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#a1a1aa]">
                  {totalCount === 0 ? "Sin usuarios" : `${totalCount} usuario${totalCount !== 1 ? "s" : ""}`}
                </span>
                {activeCount > 0 && (
                  <span className="text-[14px] font-medium bg-[#22c55e15] text-[#22c55e] px-2 py-0.5 rounded-full border border-[#22c55e20]">
                    {activeCount} activo{activeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* FAB */}
          <button
            onClick={handleAddNew}
            aria-label="Agregar nuevo usuario"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white cursor-pointer border-none transition-all duration-200 active:scale-95 shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Nuevo
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
        <UserList
          users={users}
          onEdit={handleEdit}
          loading={loading && !showForm}
        />
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      )}
    </div>
  );
}

export default UsersView;

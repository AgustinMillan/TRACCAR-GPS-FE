import React from "react";

function UserList({ users, onEdit, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-full h-20 rounded-2xl animate-pulse"
            style={{ background: "#18181b", border: "1px solid #27272a" }}
          />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-[#27272a]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h3 className="text-[#fafafa] text-[16px] font-semibold m-0 mb-1">Sin usuarios</h3>
        <p className="text-[#a1a1aa] text-[14px] m-0 max-w-[250px]">
          No hay usuarios registrados en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-24">
      {users.map((user) => (
        <div
          key={user.id}
          className="group flex flex-col p-4 rounded-2xl transition-all duration-300 relative overflow-hidden"
          style={{ background: "#18181b", border: "1px solid #27272a" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-bold ${
                  user.isActive ? "bg-[#22c55e15] text-[#22c55e]" : "bg-[#ef444415] text-[#ef4444]"
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[#fafafa] font-semibold text-[15px] leading-tight flex items-center gap-2">
                  {user.name}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold uppercase ${user.role === 'ADMIN' ? 'bg-[#6366f120] text-[#818cf8]' : 'bg-[#eab30820] text-[#fde047]'}`}>
                    {user.role}
                  </span>
                </span>
                <span className="text-[#a1a1aa] text-[13px] mt-0.5">@{user.username} | {user.phoneNumber || "Sin teléfono"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(user)}
                className="w-9 h-9 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] flex items-center justify-center transition-colors cursor-pointer border-none"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
          {user.role === "ADMIN" && user.companyDebt !== 0 && (
            <div className="mt-3 pt-3 border-t border-[#27272a]">
              <span className={`text-[13px] font-medium flex items-center gap-1.5 ${user.companyDebt > 0 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {user.companyDebt > 0 ? "Deuda" : "Adelanto"}: {user.companyDebt.toLocaleString("es-CO", { style: "currency", currency: "ARS" })}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default UserList;

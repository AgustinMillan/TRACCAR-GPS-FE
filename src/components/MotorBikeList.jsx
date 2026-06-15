const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="bg-[#18181b] rounded-xl p-4 border border-[#27272a] animate-pulse-soft">
    <div className="flex justify-between items-center gap-3">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="skeleton h-4 w-2/3 rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
        <div className="skeleton h-3 w-1/3 rounded-md" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="skeleton h-6 w-14 rounded-full" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

function MotorBikeList({ motorBikes, clients, onEdit, onCalendar, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!motorBikes || motorBikes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)" }}
        >
          <svg fill="#6366f1" stroke="#6366f1" strokeWidth="0" viewBox="0 0 256 256" height="36" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M216,120a41,41,0,0,0-6.6.55l-5.82-15.14A55.64,55.64,0,0,1,216,104a8,8,0,0,0,0-16H196.88L183.47,53.13A8,8,0,0,0,176,48H144a8,8,0,0,0,0,16h26.51l9.23,24H152c-18.5,0-33.5,4.31-43.37,12.46a16,16,0,0,1-16.76,2.07c-10.58-4.81-73.29-30.12-73.8-30.26a8,8,0,0,0-5,15.19S68.57,109.4,79.6,120.4A55.67,55.67,0,0,1,95.43,152H79.2a40,40,0,1,0,0,16h52.12a31.91,31.91,0,0,0,30.74-23.1,56,56,0,0,1,26.59-33.72l5.82,15.13A40,40,0,1,0,216,120ZM40,168H62.62a24,24,0,1,1,0-16H40a8,8,0,0,0,0,16Zm176,16a24,24,0,0,1-15.58-42.23l8.11,21.1a8,8,0,1,0,14.94-5.74L215.35,136l.65,0a24,24,0,0,1,0,48Z"></path></svg>
        </div>
        <p className="text-[15px] font-medium text-[#a1a1aa] m-0 mb-1">Sin unidades registradas</p>
        <p className="text-[14px] text-[#a1a1aa] m-0">Agrega tu primera moto con el botón +</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {motorBikes.map((moto) => (
        <div
          key={moto.id}
          className={`
            bg-[#18181b] rounded-xl p-4 transition-all duration-200
            border border-[#27272a] hover:border-[#71717a]
            ${!moto.isActive ? "opacity-50" : ""}
          `}
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center gap-3">
            {/* Status dot / icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                moto.isActive
                  ? "bg-[#22c55e15]"
                  : "bg-[#27272a]"
              }`}
            >
              <svg fill={moto.isActive ? "currentColor" : "#a1a1aa"} stroke={moto.isActive ? "none" : "currentColor"} strokeWidth="0" viewBox="0 0 256 256" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M216,120a41,41,0,0,0-6.6.55l-5.82-15.14A55.64,55.64,0,0,1,216,104a8,8,0,0,0,0-16H196.88L183.47,53.13A8,8,0,0,0,176,48H144a8,8,0,0,0,0,16h26.51l9.23,24H152c-18.5,0-33.5,4.31-43.37,12.46a16,16,0,0,1-16.76,2.07c-10.58-4.81-73.29-30.12-73.8-30.26a8,8,0,0,0-5,15.19S68.57,109.4,79.6,120.4A55.67,55.67,0,0,1,95.43,152H79.2a40,40,0,1,0,0,16h52.12a31.91,31.91,0,0,0,30.74-23.1,56,56,0,0,1,26.59-33.72l5.82,15.13A40,40,0,1,0,216,120ZM40,168H62.62a24,24,0,1,1,0-16H40a8,8,0,0,0,0,16Zm176,16a24,24,0,0,1-15.58-42.23l8.11,21.1a8,8,0,1,0,14.94-5.74L215.35,136l.65,0a24,24,0,0,1,0,48Z"></path></svg>

            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex w-fit items-center gap-2 mb-0.5">
                <h3 className="m-0 text-[14px] font-semibold text-[#fafafa] truncate">{moto.name}</h3>
                <span
                  className={`shrink-0 text-[14px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    moto.isActive
                      ? "bg-[#22c55e15] text-[#22c55e]"
                      : "bg-[#27272a] text-[#a1a1aa]"
                  }`}
                >
                  {moto.isActive ? <p className="hidden sm:block">Activa</p> : <p className="hidden sm:block">Inactiva</p>}
                  {moto.isActive ? <p className="block sm:hidden">•</p> : <p className="block sm:hidden">•</p>}
                </span>
              </div>

              <div className="flex w-fit items-center gap-3 flex-wrap">
                {moto.debt > 0 ? (
                  <span className="text-[14px] font-semibold text-[#ef4444]">
                    Deuda: ${moto.debt.toLocaleString("es-AR")}
                  </span>
                ) : (
                  <span className="text-[14px] font-semibold text-[#22c55e]">Al día</span>
                )}

                {moto.lastMaintenanceDate && (
                  <span className="text-[14px] text-[#a1a1aa]">
                    Mant. {formatDate(moto.lastMaintenanceDate)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap mt-1">
                {moto.domain && (
                  <span className="text-[13px] font-mono bg-[#27272a] text-[#fafafa] px-2 py-0.5 rounded-md border border-[#3f3f46]">
                    {moto.domain}
                  </span>
                )}
                
                {(() => {
                  const clientName = moto.client?.name || (clients && clients.find(c => c.id === moto.clientId)?.name);
                  return clientName ? (
                    <span className="text-[13px] text-[#a1a1aa] flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      {clientName}
                    </span>
                  ) : null;
                })()}
              </div>

              {moto.trackingToken && (
                <p className="m-0 mt-1 text-[13px] text-[#71717a] font-mono truncate">
                  Token: {moto.trackingToken.substring(0, 16)}...
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-all duration-150 cursor-pointer border-none bg-transparent"
                onClick={() => onEdit(moto)}
                title="Editar"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-all duration-150 cursor-pointer border-none bg-transparent"
                onClick={() => onCalendar(moto)}
                title="Calendario de pagos"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MotorBikeList;

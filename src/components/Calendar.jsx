import { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getMotorBikeDays,
  createMotorBikeDay,
  updateMotorBikeDay,
} from "../services/motorBikeDaysService";

const STATUS_CONFIG = {
  pagado:       { color: "#22c55e", bg: "#22c55e18", label: "Pagado",       icon: "✓" },
  adeudado:     { color: "#ef4444", bg: "#ef444418", label: "Adeudado",     icon: "!" },
  descanso:     { color: "#71717a", bg: "#71717a18", label: "Descanso",     icon: "-" },
  mantenimiento:{ color: "#f59e0b", bg: "#f59e0b18", label: "Mantenimiento",icon: "⚙" },
};

export default function CalendarioPagos({ motorBike, onClose }) {
  const [eventsData, setEventsData] = useState([]);
  const [currentYearMonth, setCurrentYearMonth] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modalData, setModalData] = useState({ show: false, date: "", existingRecord: null });
  const [status, setStatus] = useState("pagado");
  const [debt, setDebt] = useState(0);
  const [maintenanceDetails, setMaintenanceDetails] = useState("");

  const fetchMonthData = useCallback(async (year, month) => {
    if (!motorBike?.id) return;
    try {
      setLoading(true);
      const data = await getMotorBikeDays(motorBike.id, year, month);
      setEventsData(data);
    } catch (error) {
      console.error("Error al obtener el calendario:", error);
    } finally {
      setLoading(false);
    }
  }, [motorBike?.id]);

  const handleDatesSet = (dateInfo) => {
    const midDate = new Date((dateInfo.start.getTime() + dateInfo.end.getTime()) / 2);
    const year = midDate.getFullYear();
    const month = midDate.getMonth() + 1;
    const key = `${year}-${month}`;
    if (currentYearMonth !== key) {
      setCurrentYearMonth(key);
      fetchMonthData(year, month);
    }
  };

  const openForm = (dateStr, record = null) => {
    setModalData({ show: true, date: dateStr, existingRecord: record });
    if (record) {
      setStatus(record.status);
      setDebt(record.debt || 0);
      setMaintenanceDetails(record.maintenance?.details || "");
    } else {
      setStatus("pagado");
      setDebt(0);
      setMaintenanceDetails("");
    }
  };

  const handleDateClick = (info) => {
    const existingRecord = eventsData.find((e) => e.date === info.dateStr);
    openForm(info.dateStr, existingRecord);
  };

  const handleEventClick = (info) => {
    const existingRecord = eventsData.find((e) => e.id.toString() === info.event.id);
    if (existingRecord) openForm(existingRecord.date, existingRecord);
  };

  const handleSaveDay = async () => {
    try {
      setLoading(true);
      const payload = {
        date: modalData.date,
        status,
        debt: status === "adeudado" ? Number(debt) : 0,
        motorBikeId: motorBike.id,
      };
      if (status === "mantenimiento") payload.maintenanceDetails = maintenanceDetails;

      if (modalData.existingRecord) {
        await updateMotorBikeDay(modalData.existingRecord.id, {
          status: payload.status,
          debt: payload.debt,
          ...(payload.maintenanceDetails !== undefined ? { maintenanceDetails: payload.maintenanceDetails } : {}),
        });
      } else {
        await createMotorBikeDay(payload);
      }

      setModalData({ show: false, date: "", existingRecord: null });
      if (currentYearMonth) {
        const [y, m] = currentYearMonth.split("-");
        await fetchMonthData(parseInt(y), parseInt(m));
      }
    } catch (error) {
      console.error("Error al guardar registro de día:", error);
      alert("No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  const calendarEvents = eventsData.map((record) => ({
    id: record.id.toString(),
    title: STATUS_CONFIG[record.status]?.label || record.status,
    date: record.date,
    backgroundColor: STATUS_CONFIG[record.status]?.color || "#71717a",
    borderColor: "transparent",
    textColor: "#fff",
    classNames: ["calendar-event-pill"],
  }));

  const cfg = STATUS_CONFIG[status];

  return (
    <>
      {/* FullCalendar global overrides */}
      <style>{`
        .fc { font-family: 'Inter', sans-serif; }
        .fc .fc-toolbar { padding: 0 0 12px; gap: 8px; }
        .fc .fc-toolbar-title { font-size: 1.05rem !important; font-weight: 700 !important; color: #fafafa !important; letter-spacing: -0.01em; }
        .fc .fc-button { font-family: 'Inter', sans-serif !important; font-size: 0.8rem !important; font-weight: 600 !important; padding: 6px 14px !important; border-radius: 8px !important; transition: all 0.15s !important; }
        .fc .fc-button-primary { background: #27272a !important; border: 1px solid #3f3f46 !important; color: #a1a1aa !important; box-shadow: none !important; }
        .fc .fc-button-primary:hover { background: #3f3f46 !important; border-color: #52525b !important; color: #fafafa !important; }
        .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:focus { background: #6366f1 !important; border-color: #6366f1 !important; color: #fff !important; outline: none !important; box-shadow: 0 0 0 3px #6366f130 !important; }
        .fc .fc-button-primary:disabled { background: #18181b !important; border-color: #27272a !important; color: #52525b !important; }
        .fc-theme-standard td, .fc-theme-standard th, .fc-theme-standard .fc-scrollgrid { border-color: rgba(255,255,255,0.07) !important; }
        .fc .fc-daygrid-day-number { color: #a1a1aa; font-size: 0.8rem; font-weight: 500; padding: 6px 8px !important; text-decoration: none !important; }
        .fc .fc-col-header-cell-cushion { color: #52525b; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none !important; padding: 10px 8px !important; }
        .fc .fc-day-today { background: rgba(99,102,241,0.08) !important; }
        .fc .fc-day-today .fc-daygrid-day-number { color: #818cf8 !important; font-weight: 700; }
        .fc .fc-daygrid-day:hover { background: rgba(255,255,255,0.03); cursor: pointer; }
        .fc .fc-daygrid-day-frame { min-height: 70px; }
        .fc .fc-event { border-radius: 6px !important; font-size: 0.7rem !important; font-weight: 700 !important; letter-spacing: 0.04em; padding: 2px 6px !important; margin: 1px 2px !important; }
        .fc .fc-event:hover { opacity: 0.85; cursor: pointer; }
        .fc .fc-event-title { text-transform: uppercase; }
        .fc .fc-daygrid-event-harness { margin-top: 2px; }
        .fc .fc-scrollgrid { border-radius: 10px; overflow: hidden; }
        .fc-loading-overlay { position: absolute; inset: 0; background: rgba(9,9,11,0.5); display: flex; align-items: center; justify-content: center; z-index: 5; border-radius: 10px; }
      `}</style>

      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      >
        {/* Main panel */}
        <div
          className="w-full max-w-[860px] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #18181b 0%, #0f0f11 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            maxHeight: "92vh",
            boxShadow: "0 32px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{
              background: "linear-gradient(90deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                🏍
              </div>
              <div>
                <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>
                  Calendario de Pagos
                </p>
                <h3 className="m-0 text-base font-bold" style={{ color: "#fafafa", lineHeight: 1.2 }}>
                  {motorBike?.displayName || motorBike?.name || "Moto"}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Cerrar"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#71717a",
                fontSize: "1.1rem",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#71717a";
              }}
            >
              ✕
            </button>
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-3 px-6 py-2.5 flex-wrap flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider" style={{ color: "#ccc" }}>
              Estados:
            </span>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
              >
                <span className="text-[0.65rem]">{cfg.icon}</span>
                {cfg.label}
              </span>
            ))}
          </div>

          {/* Calendar area */}
          <div className="p-5 overflow-y-auto flex-1 relative" style={{ minHeight: 0 }}>
            {loading && !modalData.show && (
              <div className="fc-loading-overlay">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-transparent"
                    style={{
                      borderTopColor: "#6366f1",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: "#71717a" }}>Cargando…</span>
                </div>
              </div>
            )}

            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              datesSet={handleDatesSet}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              headerToolbar={{ left: "title", center: "", right: "today prev,next" }}
              locale="es"
            />

            {/* Day detail modal */}
            {modalData.show && (
              <div
                className="absolute inset-0 w-full h-full flex justify-center items-center z-20"
                style={{
                  background: "rgba(9,9,11,0.75)",
                  backdropFilter: "blur(6px)",
                  animation: "fadeIn 0.15s ease",
                }}
              >
                <div
                  className="w-[90%] max-w-[360px] rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #18181b 0%, #111113 100%)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    boxShadow: "0 24px 48px -8px rgba(0,0,0,0.7)",
                    animation: "slideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {/* Modal header */}
                  <div
                    className="px-5 py-4"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>
                      Detalle del día
                    </p>
                    <p className="m-0 mt-0.5 text-sm font-bold" style={{ color: "#fafafa" }}>
                      {modalData.date}
                    </p>
                  </div>

                  {/* Modal body */}
                  <div className="p-5 flex flex-col gap-4">
                    {/* Status select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.72rem] font-semibold uppercase tracking-wider" style={{ color: "#71717a" }}>
                        Estado del día
                      </label>
                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          disabled={loading}
                          className="w-full appearance-none rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer transition-all duration-200 focus:outline-none"
                          style={{
                            background: cfg.bg,
                            border: `1.5px solid ${cfg.color}50`,
                            color: cfg.color,
                            boxShadow: `0 0 0 0px ${cfg.color}30`,
                          }}
                          onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 3px ${cfg.color}20`}
                          onBlur={e => e.currentTarget.style.boxShadow = `0 0 0 0px ${cfg.color}30`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                            <option key={key} value={key} style={{ background: "#18181b", color: c.color }}>
                              {c.icon} {c.label}
                            </option>
                          ))}
                        </select>
                        {/* Dropdown arrow */}
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: cfg.color, opacity: 0.7 }}>
                          ▾
                        </div>
                      </div>
                    </div>

                    {/* Debt amount */}
                    {status === "adeudado" && (
                      <div className="flex flex-col gap-1.5" style={{ animation: "slideUp 0.18s ease" }}>
                        <label className="text-[0.72rem] font-semibold uppercase tracking-wider" style={{ color: "#71717a" }}>
                          Deuda generada ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={debt}
                          onChange={(e) => setDebt(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none"
                          style={{
                            background: "rgba(239,68,68,0.06)",
                            border: "1.5px solid rgba(239,68,68,0.25)",
                            color: "#fafafa",
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)";
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Maintenance details */}
                    {status === "mantenimiento" && (
                      <div className="flex flex-col gap-1.5" style={{ animation: "slideUp 0.18s ease" }}>
                        <label className="text-[0.72rem] font-semibold uppercase tracking-wider" style={{ color: "#71717a" }}>
                          Detalles del Mantenimiento
                          <span className="ml-1 normal-case" style={{ color: "#52525b" }}>(Opcional)</span>
                        </label>
                        <textarea
                          value={maintenanceDetails}
                          onChange={(e) => setMaintenanceDetails(e.target.value)}
                          disabled={loading}
                          placeholder="Ej: Cambio de aceite, frenos..."
                          rows={3}
                          className="w-full rounded-xl px-4 py-3 text-sm font-medium resize-y transition-all duration-200 focus:outline-none"
                          style={{
                            background: "rgba(245,158,11,0.06)",
                            border: "1.5px solid rgba(245,158,11,0.25)",
                            color: "#fafafa",
                            fontFamily: "inherit",
                            minHeight: "80px",
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = "rgba(245,158,11,0.25)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModalData({ show: false, date: "", existingRecord: null })}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#71717a",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "#a1a1aa";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.color = "#71717a";
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveDay}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                        style={{
                          background: loading
                            ? "#3f3f46"
                            : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                          border: "none",
                          boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading ? (
                          <>
                            <div
                              className="w-3.5 h-3.5 rounded-full border-2 border-transparent"
                              style={{ borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }}
                            />
                            Guardando…
                          </>
                        ) : (
                          "Guardar"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

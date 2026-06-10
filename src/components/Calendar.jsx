import { useState, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getMotorBikeDays,
  createMotorBikeDay,
  updateMotorBikeDay,
} from "../services/motorBikeDaysService";

const STATUS_COLORS = {
  pagado: "#16a34a", // verde
  adeudado: "#dc2626", // rojo
  descanso: "#9ca3af", // gris
  mantenimiento: "#ca8a04", // amarillo oscuro
};

export default function CalendarioPagos({ motorBike, onClose }) {
  const [eventsData, setEventsData] = useState([]);
  const [currentYearMonth, setCurrentYearMonth] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalData, setModalData] = useState({
    show: false,
    date: "",
    existingRecord: null,
  });

  // Form State
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
    // Tomamos la fecha a mitad de vista para saber el mes actual de forma precisa
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
    const recordId = info.event.id;
    const existingRecord = eventsData.find((e) => e.id.toString() === recordId);
    if (existingRecord) {
      openForm(existingRecord.date, existingRecord);
    }
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

      if (status === "mantenimiento") {
        payload.maintenanceDetails = maintenanceDetails;
      }

      if (modalData.existingRecord) {
        // Actualizar registro
        await updateMotorBikeDay(modalData.existingRecord.id, {
          status: payload.status,
          debt: payload.debt,
          ...(payload.maintenanceDetails !== undefined ? { maintenanceDetails: payload.maintenanceDetails } : {})
        });
      } else {
        // Crear registro
        await createMotorBikeDay(payload);
      }

      // Cerrar modal
      setModalData({ show: false, date: "", existingRecord: null });
      
      // Recargar datos del mes actual
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

  // Mapear records a FullCalendar events
  const calendarEvents = eventsData.map((record) => ({
    id: record.id.toString(),
    title: record.status.toUpperCase(),
    date: record.date,
    backgroundColor: STATUS_COLORS[record.status] || "#9ca3af",
    borderColor: STATUS_COLORS[record.status] || "#9ca3af",
  }));

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/75 flex justify-center items-center z-[1000] p-4">
      <div className="bg-[#1f2937] rounded-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)]">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h3 className="m-0 text-xl text-[#f3f4f6]">Calendario: {motorBike?.name || "Moto"}</h3>
          <button className="bg-transparent border-none text-[#9ca3af] text-2xl cursor-pointer p-0 flex items-center justify-center transition-colors duration-200 hover:text-[#ef4444]" onClick={onClose} title="Cerrar">
            ✖
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 relative [&_.fc-theme-standard_td]:border-white/10 [&_.fc-theme-standard_th]:border-white/10 [&_.fc-daygrid-day-number]:text-[#d1d5db] [&_.fc-daygrid-day-number]:no-underline [&_.fc-col-header-cell-cushion]:text-[#9ca3af] [&_.fc-col-header-cell-cushion]:p-2 [&_.fc_.fc-toolbar-title]:text-[#f3f4f6] [&_.fc_.fc-toolbar-title]:text-[1.2rem] [&_.fc_.fc-button-primary]:bg-[#374151] [&_.fc_.fc-button-primary]:border-[#4b5563] [&_.fc_.fc-button-primary:hover]:!bg-[#4b5563] [&_.fc_.fc-button-primary:hover]:!border-[#6b7280] [&_.fc_.fc-button-primary:hover]:!shadow-none [&_.fc_.fc-button-primary:active]:!bg-[#4b5563] [&_.fc_.fc-button-primary:active]:!border-[#6b7280] [&_.fc_.fc-button-primary:active]:!shadow-none [&_.fc_.fc-button-primary:focus]:!bg-[#4b5563] [&_.fc_.fc-button-primary:focus]:!border-[#6b7280] [&_.fc_.fc-button-primary:focus]:!shadow-none [&_.fc_.fc-button-primary:disabled]:bg-[#1f2937] [&_.fc_.fc-button-primary:disabled]:border-[#374151] [&_.fc-day-today]:!bg-[#3b82f6]/10">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'today prev,next'
            }}
            locale="es"
          />

          {/* Formulario Modal sobre el calendario */}
          {modalData.show && (
            <div className="absolute inset-0 w-full h-full bg-[#1f2937]/85 backdrop-blur-sm flex justify-center items-center z-10">
              <div className="bg-[#111827] border border-white/10 rounded-xl p-6 w-[90%] max-w-[350px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)]">
                <h4 className="m-0 mb-4 text-[#f3f4f6] text-[1.1rem] text-center">Detalle del {modalData.date}</h4>
                
                <div className="mb-4">
                  <label className="block mb-1">Estado del día</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                    style={{color: "gray"}}
                    className="w-full p-3 bg-white/5 border border-white/10 text-[#f3f4f6] rounded-lg text-base box-border focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="adeudado">Adeudado</option>
                    <option value="descanso">Descanso</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                {status === "adeudado" && (
                  <div className="mb-4">
                    <label className="block mb-1">Deuda generada ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={debt}
                      onChange={(e) => setDebt(e.target.value)}
                      disabled={loading}
                      className="w-full p-3 bg-white/5 border border-white/10 text-[#f3f4f6] rounded-lg text-base box-border focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                )}

                {status === "mantenimiento" && (
                  <div className="mb-4 mt-2">
                    <label className="block mb-1">Detalles del Mantenimiento (Opcional)</label>
                    <textarea
                      value={maintenanceDetails}
                      onChange={(e) => setMaintenanceDetails(e.target.value)}
                      disabled={loading}
                      placeholder="Ej: Cambio de aceite, frenos..."
                      className="w-full p-2 rounded border border-gray-600 bg-white/5 text-gray-100 resize-y min-h-[60px] font-inherit focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <button 
                    className="flex-1 p-3 rounded-lg font-semibold cursor-pointer border transition-opacity duration-200 text-[0.95rem] bg-transparent text-[#9ca3af] border-[#4b5563] hover:opacity-90 disabled:bg-[#4b5563] disabled:cursor-not-allowed disabled:opacity-50" 
                    onClick={() => setModalData({ show: false, date: "", existingRecord: null })}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="flex-1 p-3 rounded-lg font-semibold cursor-pointer border transition-opacity duration-200 text-[0.95rem] bg-[#3b82f6] text-white border-none hover:opacity-90 disabled:bg-[#4b5563] disabled:cursor-not-allowed disabled:opacity-50" 
                    onClick={handleSaveDay}
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

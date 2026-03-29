import { useState, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getMotorBikeDays,
  createMotorBikeDay,
  updateMotorBikeDay,
} from "../services/motorBikeDaysService";
import "./Calendar.css";

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
    <div className="calendar-overlay">
      <div className="calendar-container">
        
        <div className="calendar-header">
          <h3>Calendario: {motorBike?.name || "Moto"}</h3>
          <button className="close-btn" onClick={onClose} title="Cerrar">
            ✖
          </button>
        </div>

        <div className="calendar-body">
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
            <div className="day-modal-overlay">
              <div className="day-modal">
                <h4>Detalle del {modalData.date}</h4>
                
                <div className="form-group">
                  <label>Estado del día</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                    style={{color: "gray"}}
                  >
                    <option value="pagado">Pagado</option>
                    <option value="adeudado">Adeudado</option>
                    <option value="descanso">Descanso</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                {status === "adeudado" && (
                  <div className="form-group">
                    <label>Deuda generada ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={debt}
                      onChange={(e) => setDebt(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                {status === "mantenimiento" && (
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Detalles del Mantenimiento (Opcional)</label>
                    <textarea
                      value={maintenanceDetails}
                      onChange={(e) => setMaintenanceDetails(e.target.value)}
                      disabled={loading}
                      placeholder="Ej: Cambio de aceite, frenos..."
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #4b5563",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: "#f3f4f6",
                        resize: "vertical",
                        minHeight: "60px",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    className="btn-cancel" 
                    onClick={() => setModalData({ show: false, date: "", existingRecord: null })}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-save" 
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

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import "./Calendar.css";

const statusColor = {
  pagado: "#16a34a", // verde
  adeudado: "#dc2626", // rojo
  "dia libre": "#9ca3af", // gris
};

const data = [
  { date: "2026-02-18", status: "pagado" },
  { date: "2026-02-19", status: "adeudado" },
  { date: "2026-02-20", status: "dia libre" },
];

export default function CalendarioPagos({ onClose }) {
  const events = data.map((item) => ({
    title: item.status,
    date: item.date,
    backgroundColor: statusColor[item.status],
    borderColor: statusColor[item.status],
  }));

  return (
    <div className="calendario-pagos">
      <button onClick={onClose}>X</button>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );
}

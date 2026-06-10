import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getMonthlyReport } from "../services/reportService";
import { useNavigate } from "react-router-dom";

// Brand-aligned chart palette
const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6",
];

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const selectClass = `
  px-3 py-2 rounded-lg text-[14px] font-medium text-[#fafafa]
  bg-[#18181b] border border-[#71717a] outline-none cursor-pointer
  transition-all duration-200
  focus:border-[#6366f1]
`;

function StatCard({ label, value, color, icon, accent }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderLeft: `2px solid ${accent}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] text-white">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px]"
          style={{ background: `${accent}15` }}
        >
          {icon}
        </div>
      </div>
      <p className="m-0 text-[22px] font-bold tracking-tight" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function ReportsView() {
  const navigate = useNavigate();
  const currentDate = new Date();

  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalSavings: 0,
    expensesByCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const years = Array.from(
    { length: currentDate.getFullYear() - 2023 + 2 },
    (_, i) => 2023 + i,
  );

  useEffect(() => {
    loadReport();
  }, [year, month]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await getMonthlyReport(year, month);
      setData(reportData);
    } catch (err) {
      setError(err.message || "Error al cargar reporte mensual");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const netBalance = data.totalIncome - data.totalExpense;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "#27272a", border: "1px solid #71717a", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
        >
          <p className="m-0 mb-1 font-semibold text-[14px] text-[#fafafa]">{payload[0].name}</p>
          <p className="m-0 text-[14px] text-[#a1a1aa]">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const chartData = data.expensesByCategory.map((category) => ({
    name: category.categoryName,
    value: category.total,
  }));

  return (
    <div className="w-full pb-8 min-h-full bg-[#09090b] flex flex-col">
      {/* Page header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#18181b]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-[#fafafa] m-0 mb-1 tracking-tight">Reportes</h1>
            <p className="m-0 text-[14px] text-[#a1a1aa]">Resumen financiero mensual</p>
          </div>

          {/* Period selectors */}
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={selectClass}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={selectClass}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
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

      <div className="flex-1 px-4 py-4 flex flex-col gap-4">
        {loading ? (
          /* Skeleton state */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#18181b] rounded-xl h-24 animate-pulse-soft border border-[#27272a]">
                  <div className="p-4 flex flex-col gap-3">
                    <div className="skeleton h-2.5 w-1/2 rounded" />
                    <div className="skeleton h-6 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#18181b] rounded-xl h-64 animate-pulse-soft border border-[#27272a]" />
          </div>
        ) : (
          <>
            {/* Stat cards grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Ingresos"
                value={formatCurrency(data.totalIncome)}
                color="#22c55e"
                accent="#22c55e"
                icon="↑"
              />
              <StatCard
                label="Gastos"
                value={formatCurrency(data.totalExpense)}
                color="#ef4444"
                accent="#ef4444"
                icon="↓"
              />
              {data.totalSavings > 0 && (
                <StatCard
                  label="Ahorros"
                  value={formatCurrency(data.totalSavings)}
                  color="#f59e0b"
                  accent="#f59e0b"
                  icon="🏦"
                />
              )}
              <StatCard
                label="Balance neto"
                value={formatCurrency(netBalance)}
                color={netBalance >= 0 ? "#22c55e" : "#ef4444"}
                accent={netBalance >= 0 ? "#22c55e" : "#ef4444"}
                icon={netBalance >= 0 ? "=" : "!"}
              />
            </div>

            {/* Chart */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#18181b", border: "1px solid #27272a" }}
            >
              <div className="px-4 py-3.5 border-b border-[#27272a]">
                <p className="m-0 text-[15px] text-white">Gastos por categoría</p>
                <p className="m-0 text-[14px] text-[#a1a1aa]">
                  {MONTHS.find((m) => m.value === month)?.label} {year}
                </p>
              </div>

              {chartData.length > 0 ? (
                <div className="p-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={50}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: "#a1a1aa", fontSize: "11px" }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 px-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                      <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-[14px] font-medium text-[#a1a1aa] m-0 mb-1">Sin gastos registrados</p>
                  <p className="text-[14px] text-[#a1a1aa] m-0 text-center">
                    No hay egresos en {MONTHS.find((m) => m.value === month)?.label} {year}
                  </p>
                </div>
              )}
            </div>

            {/* Categories button */}
            <button
              onClick={() => navigate("/categories")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-semibold text-[#a1a1aa] cursor-pointer border-none bg-[#18181b] hover:bg-[#27272a] transition-all duration-200 border border-[#27272a]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#a1a1aa]">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
              Administrar categorías
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportsView;

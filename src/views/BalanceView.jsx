import { useState, useEffect } from "react";
import {
  getAllAccounts,
  createAccount,
  getAllPayments,
  updateAccount,
  createPayment,
  updatePayment,
  createTransfer,
} from "../services/balanceService";
import {
  getAllMotorBikes,
  getMotorBikeDebts,
} from "../services/motorBikeService";
import CalendarioPagos from "../components/Calendar";

import { getCategories } from "../services/categoryService";

// ─── Shared primitives ───────────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg text-[14px] text-[#fafafa] placeholder:text-[#71717a] transition-all duration-200 outline-none bg-[#09090b] border border-[#71717a] focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]";

const selectCls =
  "w-full px-3.5 py-2.5 rounded-lg text-[14px] text-[#fafafa] transition-all duration-200 outline-none bg-[#09090b] border border-[#71717a] focus:border-[#6366f1] cursor-pointer";

const labelCls =
  "block mb-1.5 text-[14px] font-semibold text-[#a1a1aa] uppercase tracking-wider";

const btnPrimary =
  "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white cursor-pointer border-none transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

const btnSecondary =
  "flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-[#a1a1aa] cursor-pointer border-none bg-[#27272a] hover:bg-[#71717a] transition-all duration-200 disabled:opacity-40";

// ─── Modal shell ─────────────────────────────────────────────────────
function Modal({ onClose, children, title, accent = "#6366f1" }) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full mx-5 self-center sm:max-w-[500px] max-h-[92dvh] overflow-y-auto animate-slide-up rounded-2xl"
        style={{
          background: "#18181b",
          border: "1px solid #27272a",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-[#27272a] sticky top-0 z-10 rounded-t-2xl sm:rounded-t-2xl"
          style={{ background: "#18181b" }}
        >
          <h3 className="m-0 text-[15px] font-semibold text-[#fafafa]">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-all cursor-pointer border-none bg-transparent"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────
const Spinner = ({ size = 13 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

function BalanceView() {
  const [categories, setCategories] = useState([]);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState({
    accountId: "",
    motorBikeId: "",
    categoryId: "",
    amount: "",
    type: "ingreso",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [submittingEditPayment, setSubmittingEditPayment] = useState(false);
  const [page, setPage] = useState(1);
  const [totalpages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    motorBikeId: "",
    type: "ingreso",
    startDate: "",
    endDate: "",
  });

  const [showPromptCalendar, setShowPromptCalendar] = useState(false);
  const [promptMotorBike, setPromptMotorBike] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleEditPayment = (payment) => {
    setEditPaymentId(payment.id);
    setEditPaymentData({
      accountId: payment.accountId?.toString() || "",
      motorBikeId: payment.motorBikeId?.toString() || "",
      categoryId: payment.categoryId?.toString() || "",
      amount: payment.amount?.toString() || "",
      type: payment.type || "ingreso",
      date: payment.date ? payment.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: payment.description || "",
    });
  };

  const handleUpdatePayment = async () => {
    if (!editPaymentData.accountId || !editPaymentData.amount || !editPaymentData.type || !editPaymentData.date) {
      setError("Cuenta, monto, tipo y fecha son obligatorios");
      return;
    }
    setSubmittingEditPayment(true);
    try {
      await updatePayment(editPaymentId, {
        accountId: Number(editPaymentData.accountId),
        motorBikeId: editPaymentData.motorBikeId ? Number(editPaymentData.motorBikeId) : null,
        categoryId: editPaymentData.categoryId ? Number(editPaymentData.categoryId) : null,
        amount: Number(editPaymentData.amount),
        type: editPaymentData.type,
        date: editPaymentData.date,
        description: editPaymentData.description,
      });
      setEditPaymentId(null);
      setEditPaymentData({
        accountId: "", motorBikeId: "", categoryId: "", amount: "",
        type: "ingreso", date: new Date().toISOString().slice(0, 10), description: "",
      });
      await loadData();
    } catch (err) {
      setError(err.message || "Error al actualizar transacción");
    } finally {
      setSubmittingEditPayment(false);
    }
  };

  const [showTransactionFormPayment, setShowTransactionFormPayment] = useState(false);
  const [transactionPaymentData, setTransactionPaymentData] = useState({
    accountId: "", motorBikeId: "", categoryId: "", amount: "",
    type: "ingreso", date: new Date().toISOString().slice(0, 10), description: "",
  });

  const [showTransactionFormBill, setShowTransactionFormBill] = useState(false);
  const [transactionBillData, setTransactionBillData] = useState({
    accountId: "", categoryId: "", amount: "",
    type: "egreso", date: new Date().toISOString().slice(0, 10), description: "",
  });

  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferMode, setTransferMode] = useState("save");
  const [transferData, setTransferData] = useState({
    fromAccountId: "", toAccountId: "", amount: "",
    date: new Date().toISOString().slice(0, 10), description: "",
  });
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  const openTransferModal = (mode) => {
    setTransferMode(mode);
    setTransferData({
      fromAccountId: "", toAccountId: "", amount: "",
      date: new Date().toISOString().slice(0, 10), description: "",
    });
    setShowTransferModal(true);
  };

  const handleCreateTransfer = async () => {
    const ahorrosAccount = accounts.find((a) => a.name === "Ahorros");
    if (!ahorrosAccount && transferMode !== "between") {
      setError('No existe una cuenta llamada "Ahorros". Créala primero desde la sección de cuentas.');
      return;
    }

    if (transferMode === "between") {
      if (!transferData.fromAccountId || !transferData.toAccountId) {
        setError("Seleccioná la cuenta de origen y destino");
        return;
      }
      if (Number(transferData.fromAccountId) === Number(transferData.toAccountId)) {
        setError("La cuenta de origen y la de destino no pueden ser la misma");
        return;
      }
    } else {
      if (!transferData.fromAccountId && transferMode === "save") { setError("Seleccioná la cuenta de origen"); return; }
      if (!transferData.toAccountId && transferMode === "withdraw") { setError("Seleccioná la cuenta destino"); return; }
    }

    if (!transferData.amount) { setError("Ingresá un monto"); return; }

    const fromId =
      transferMode === "save" ? Number(transferData.fromAccountId)
      : transferMode === "withdraw" ? ahorrosAccount.id
      : Number(transferData.fromAccountId);

    const toId =
      transferMode === "save" ? ahorrosAccount.id
      : transferMode === "withdraw" ? Number(transferData.toAccountId)
      : Number(transferData.toAccountId);

    setSubmittingTransfer(true);
    try {
      await createTransfer({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: Number(transferData.amount),
        date: transferData.date,
        description:
          transferData.description ||
          (transferMode === "save" ? "Añadir a ahorros"
           : transferMode === "withdraw" ? "Sacar de ahorros"
           : "Transferencia entre cuentas"),
      });
      setShowTransferModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Error al realizar la transferencia");
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const handleCreateTransaction = async (type) => {
    setSubmittingTransaction(true);
    try {
      if (type === "ingreso") {
        if (!transactionPaymentData.accountId || !transactionPaymentData.amount) {
          setError("Cuenta y monto son obligatorios"); return;
        }
        await createPayment({
          accountId: Number(transactionPaymentData.accountId),
          motorBikeId: transactionPaymentData.motorBikeId ? Number(transactionPaymentData.motorBikeId) : null,
          categoryId: transactionPaymentData.categoryId ? Number(transactionPaymentData.categoryId) : null,
          amount: Number(transactionPaymentData.amount),
          type,
          date: transactionPaymentData.date,
          description: transactionPaymentData.description,
        });
        const pagoMotorBikeId = transactionPaymentData.motorBikeId;
        setShowTransactionFormPayment(false);
        setTransactionPaymentData({
          accountId: "", motorBikeId: "", categoryId: "", amount: "",
          type: "ingreso", date: new Date().toISOString().slice(0, 10), description: "",
        });
        await loadData();
        if (pagoMotorBikeId) {
          const bike = motorBikes.find((b) => b.id.toString() === pagoMotorBikeId.toString());
          if (bike) { setPromptMotorBike(bike); setShowPromptCalendar(true); }
        }
      } else if (type === "egreso") {
        if (!transactionBillData.accountId || !transactionBillData.amount) {
          setError("Cuenta y monto son obligatorios"); return;
        }
        await createPayment({
          accountId: Number(transactionBillData.accountId),
          amount: Number(transactionBillData.amount),
          categoryId: transactionBillData.categoryId ? Number(transactionBillData.categoryId) : null,
          type,
          date: transactionBillData.date,
          description: transactionBillData.description,
        });
        setShowTransactionFormBill(false);
        setTransactionBillData({
          accountId: "", amount: "", type: "egreso",
          date: new Date().toISOString().slice(0, 10), description: "",
        });
        await loadData();
      }
    } catch (err) {
      setError(err.message || "Error al crear transacción");
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [motorBikes, setMotorBikes] = useState([]);
  const [debtsReport, setDebtsReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", alias: "" });
  const [editAccountId, setEditAccountId] = useState(null);
  const [editAccountData, setEditAccountData] = useState({ name: "", alias: "" });

  const handleEditAccount = (account) => {
    setEditAccountId(account.id);
    setEditAccountData({ name: account.name, alias: account.alias || "" });
  };

  const handleUpdateAccount = async () => {
    if (!editAccountData.name.trim()) { setError("El nombre de la cuenta no puede estar vacío"); return; }
    try {
      await updateAccount(editAccountId, {
        name: editAccountData.name.trim(),
        alias: editAccountData.alias.trim(),
      });
      setEditAccountId(null);
      setEditAccountData({ name: "", alias: "" });
      await loadData();
    } catch (err) {
      setError(err.message || "Error al actualizar cuenta");
    }
  };

  useEffect(() => {
    loadData().then(() => { console.log("Datos cargados correctamente"); }).catch((err) => { console.error("Error al cargar datos:", err); });
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Cargando cuentas, pagos y motos...");
      const [accountsData, paymentsData, bikesData, debtsData, categoriesData] = await Promise.all([
        getAllAccounts(),
        getAllPayments(page, setTotalPages, filters),
        getAllMotorBikes(),
        getMotorBikeDebts().catch((err) => { console.error("Error al cargar deudas:", err); return { data: [] }; }),
        getCategories(),
      ]);
      setAccounts(accountsData);
      setPayments(paymentsData);
      setMotorBikes(bikesData);
      setDebtsReport(debtsData.data || []);
      setCategories(categoriesData);
      console.log("Cuentas cargadas:", accountsData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.name.trim()) { setError("El nombre de la cuenta no puede estar vacío"); return; }
    try {
      await createAccount({ name: newAccount.name.trim(), alias: newAccount.alias.trim() });
      setNewAccount({ name: "", alias: "" });
      setShowNewAccountForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Error al crear cuenta");
    }
  };

  const getMotorBikeName = (bikeId) => {
    const bike = motorBikes.find((b) => b.id === bikeId);
    return bike ? bike.name : "—";
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString) => dateString;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full px-4 pt-5 min-h-full bg-[#09090b] flex flex-col pb-10">

      <div>
        <h1 className="text-4xl font-bold text-[#fafafa] m-0 mb-1 tracking-tight">Balance</h1>
        <p className="m-0 text-[14px] text-[#a1a1aa]">Resumen de gastos e ingresos</p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#fca5a5] animate-fade-in"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" className="shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-[#ef4444] opacity-60 hover:opacity-100 transition-opacity cursor-pointer border-none bg-transparent p-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="flex flex-col gap-4 px-4 py-5">
          {/* Debt skeleton */}
          <div className="bg-[#18181b] rounded-xl h-20 animate-pulse-soft border border-[#27272a]" />
          {/* Account skeletons */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#18181b] rounded-xl h-28 animate-pulse-soft border border-[#27272a]">
                <div className="p-4 flex flex-col gap-2">
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-7 w-3/4 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-[#27272a] last:border-b-0">
                <div className="skeleton h-3.5 w-16 rounded" />
                <div className="skeleton h-5 w-12 rounded-full" />
                <div className="skeleton h-3.5 w-20 rounded" />
                <div className="skeleton h-3.5 w-24 rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-5 px-4 pt-5">

          {/* ══ DEBTS SECTION ══ */}
          {(() => {
            const motosConDeuda = debtsReport.filter((d) => d.debt > 0);
            const totalDeuda = motosConDeuda.reduce((acc, curr) => acc + curr.debt, 0);
            if (motosConDeuda.length === 0) {
              return (
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e15] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <p className="m-0 text-[14px] font-medium text-[#22c55e]">Todas las motos están al día. Sin deudas pendientes.</p>
                </div>
              );
            }
            return (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#18181b", border: "1px solid rgba(239,68,68,0.25)", borderLeft: "3px solid #ef4444" }}
              >
                <div className="px-4 py-3 border-b border-[#27272a]">
                  <div className="flex items-center justify-between">
                    <p className="m-0 text-[14px] font-semibold text-[#fafafa]">Deudas activas</p>
                    <span className="text-[14px] font-bold text-[#ef4444]">{formatCurrency(totalDeuda)}</span>
                  </div>
                  <p className="m-0 text-[14px] text-[#a1a1aa] mt-0.5">
                    {motosConDeuda.length} moto{motosConDeuda.length !== 1 ? "s" : ""} con deuda
                  </p>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {motosConDeuda.map((moto) => (
                    <div
                      key={moto.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      <span className="text-[14px] font-semibold text-[#fca5a5]">{moto.name}</span>
                      <span className="text-[14px] text-[#ef4444] font-bold">{formatCurrency(moto.debt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ══ ACCOUNTS SECTION ══ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="m-0 text-[15px] text-white">Cuentas</h2>
              <button
                onClick={() => setShowNewAccountForm(true)}
                className="flex items-center gap-1.5 text-[14px] font-semibold text-[#6366f1] hover:text-[#818cf8] cursor-pointer border-none bg-transparent p-0 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                Nueva
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #1e1e23 0%, #18181b 100%)",
                    border: "1px solid #27272a",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {editAccountId === account.id ? (
                    <div className="p-3 flex flex-col gap-2">
                      <input
                        type="text"
                        value={editAccountData.name}
                        onChange={(e) => setEditAccountData({ ...editAccountData, name: e.target.value })}
                        placeholder="Nombre"
                        autoFocus
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={editAccountData.alias}
                        onChange={(e) => setEditAccountData({ ...editAccountData, alias: e.target.value })}
                        placeholder="Alias (opcional)"
                        className={inputCls}
                      />
                      <div className="flex gap-2 mt-1">
                        <button onClick={handleUpdateAccount} className={`${btnPrimary} flex-1 py-2 text-[14px]`} style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                          Guardar
                        </button>
                        <button onClick={() => setEditAccountId(null)} className={`${btnSecondary} flex-1 py-2 text-[14px]`}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="px-3 pt-3 pb-2 flex items-start justify-between"
                        style={{ background: "rgba(99,102,241,0.06)", borderBottom: "1px solid #27272a" }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-[14px] font-semibold text-[#fafafa] truncate">{account.name}</p>
                          {account.alias && <p className="m-0 text-[14px] text-[#a1a1aa] truncate">{account.alias}</p>}
                        </div>
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-[#6366f1] hover:text-[#818cf8] hover:bg-[#27272a] transition-all cursor-pointer border border-[#6366f1] bg-transparent shrink-0 ml-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                      </div>
                      <div className="px-3 py-3">
                        <p className="m-0 text-[14px] text-[#a1a1aa] uppercase tracking-wider mb-1">Balance</p>
                        <p
                          className="m-0 text-[18px] font-bold tracking-tight"
                          style={{ color: (account.balance || 0) >= 0 ? "#22c55e" : "#ef4444" }}
                        >
                          {formatCurrency(account.balance || 0)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add account card */}
              <button
                onClick={() => setShowNewAccountForm(true)}
                className="rounded-xl flex flex-col items-center justify-center min-h-[100px] cursor-pointer border-none transition-all duration-200 text-[#a1a1aa] hover:text-[#a1a1aa]"
                style={{ background: "#18181b", border: "1.5px dashed #27272a" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#a1a1aa"; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mb-1">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                <span className="text-[14px] font-medium">Nueva cuenta</span>
              </button>
            </div>
          </div>

          {/* ══ TRANSACTIONS SECTION ══ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="m-0 text-[15px] text-white">Transacciones</h2>
            </div>

            {/* Filters */}
            <div
              className="rounded-xl p-3 mb-3 flex flex-wrap gap-2 items-end"
              style={{ background: "#18181b", border: "1px solid #27272a" }}
            >
              <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                <label className={labelCls}>Moto</label>
                <select value={filters.motorBikeId} onChange={(e) => setFilters({ ...filters, motorBikeId: e.target.value })} className={selectCls}>
                  <option value="">Todas</option>
                  {motorBikes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[90px]">
                <label className={labelCls}>Tipo</label>
                <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className={selectCls}>
                  <option value="ingreso">Ingresos</option>
                  <option value="egreso">Egresos</option>
                  <option value="">Todos</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <label className={labelCls}>Desde</label>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                <label className={labelCls}>Hasta</label>
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className={inputCls} />
              </div>
              <button
                onClick={() => { setPage(1); loadData(); }}
                className={btnPrimary}
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                Filtrar
              </button>
            </div>

            {/* Table / Empty state */}
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                    <path d="M9 14l6-6m-5 1h.01M14 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-[#a1a1aa] m-0 mb-1">Sin transacciones</p>
                <p className="text-[14px] text-[#a1a1aa] m-0">Agrega un ingreso o egreso para comenzar</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ background: "#18181b", border: "1px solid #27272a" }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[14px]">
                    <thead>
                      <tr style={{ background: "#09090b", borderBottom: "1px solid #27272a" }}>
                        {["Monto", "Tipo", "Moto", "Fecha", "Descripción"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-[14px] text-white  tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="transition-colors duration-150 hover:bg-[#27272a]"
                          style={{ borderBottom: "1px solid #27272a" }}
                        >
                          {editPaymentId === payment.id ? (
                            <td colSpan={5} className="px-4 py-4">
                              <form
                                className="flex flex-wrap gap-3"
                                onSubmit={(e) => { e.preventDefault(); handleUpdatePayment(); }}
                              >
                                <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                                  <label className={labelCls}>Cuenta</label>
                                  <select value={editPaymentData.accountId} onChange={(e) => setEditPaymentData({ ...editPaymentData, accountId: e.target.value })} required className={selectCls}>
                                    <option value="">Seleccionar...</option>
                                    {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                                  <label className={labelCls}>Moto</label>
                                  <select value={editPaymentData.motorBikeId} onChange={(e) => setEditPaymentData({ ...editPaymentData, motorBikeId: e.target.value })} className={selectCls}>
                                    <option value="">Sin moto</option>
                                    {motorBikes.map((bike) => <option key={bike.id} value={bike.id}>{bike.name}</option>)}
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[90px]">
                                  <label className={labelCls}>Monto</label>
                                  <input type="number" value={editPaymentData.amount} onChange={(e) => setEditPaymentData({ ...editPaymentData, amount: e.target.value })} min="1" required className={inputCls} />
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
                                  <label className={labelCls}>Fecha</label>
                                  <input type="date" value={editPaymentData.date} onChange={(e) => setEditPaymentData({ ...editPaymentData, date: e.target.value })} required className={inputCls} />
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                  <label className={labelCls}>Descripción</label>
                                  <input type="text" value={editPaymentData.description} onChange={(e) => setEditPaymentData({ ...editPaymentData, description: e.target.value })} maxLength={100} className={inputCls} />
                                </div>
                                <div className="flex items-end gap-2 w-full justify-end mt-1">
                                  <button type="submit" disabled={submittingEditPayment} className={btnPrimary} style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                                    {submittingEditPayment ? <><Spinner />Guardando...</> : "Guardar"}
                                  </button>
                                  <button type="button" onClick={() => setEditPaymentId(null)} className={btnSecondary}>
                                    Cancelar
                                  </button>
                                </div>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`text-[14px] font-bold ${payment.isTransfer ? "text-[#a1a1aa]" : payment.type === "ingreso" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                                  {payment.isTransfer ? "" : payment.type === "ingreso" ? "+ " : "− "}
                                  {formatCurrency(Math.abs(payment.amount))}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {payment.isTransfer ? (
                                  <span className="inline-flex items-center gap-1 text-[14px] font-semibold px-2 py-1 rounded-full bg-[#27272a] text-[#a1a1aa]">
                                    ↔ Transfer.
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-block text-[14px] font-semibold px-2 py-0.5 rounded-full ${
                                      payment.type === "ingreso"
                                        ? "bg-[#22c55e15] text-[#22c55e]"
                                        : "bg-[#ef444415] text-[#ef4444]"
                                    }`}
                                  >
                                    {payment.type === "ingreso" ? "Ingreso" : "Egreso"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-[#a1a1aa] whitespace-nowrap">
                                {getMotorBikeName(payment.motorBikeId)}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-[#a1a1aa] whitespace-nowrap">
                                {formatDate(payment.date)}
                              </td>
                              <td className="px-4 py-3 text-[14px] text-[#a1a1aa]">
                                <div className="flex items-center gap-2">
                                  <span className="italic">{payment.description || "—"}</span>
                                  {!payment.isTransfer && (
                                    <button
                                      onClick={() => handleEditPayment(payment)}
                                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-[#6366f1] hover:text-[#818cf8] hover:bg-[#27272a] transition-all cursor-pointer border border-[#6366f1] bg-transparent"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-[#27272a]">
                  <button
                    onClick={() => { if (page > 1) setPage(page - 1); }}
                    disabled={page <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] cursor-pointer border-none bg-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                  </button>
                  <span className="text-[14px] font-medium text-[#a1a1aa]">{page} / {totalpages}</span>
                  <button
                    onClick={() => { if (page < totalpages) setPage(page + 1); }}
                    disabled={page >= totalpages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] cursor-pointer border-none bg-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══ ACTION BUTTONS ══ */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => { setShowTransactionFormPayment(true); setShowTransactionFormBill(false); setShowTransferModal(false); }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex-1 text-[#22c55e] hover:bg-[#22c55e15] cursor-pointer"
              style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.3)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Ingreso
            </button>
            <button
              onClick={() => { setShowTransactionFormBill(true); setShowTransactionFormPayment(false); setShowTransferModal(false); }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex-1 text-[#ef4444] hover:bg-[#ef444415] cursor-pointer"
              style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
              Egreso
            </button>
            <button
              onClick={() => { setShowTransactionFormPayment(false); setShowTransactionFormBill(false); openTransferModal("save"); }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex-1 text-[#f59e0b] hover:bg-[#f59e0b15] cursor-pointer"
              style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.4)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>
              Ahorrar
            </button>
            <button
              onClick={() => { setShowTransactionFormPayment(false); setShowTransactionFormBill(false); openTransferModal("withdraw"); }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] flex-1 text-[#8b5cf6] hover:bg-[#8b5cf615] cursor-pointer"
              style={{ background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.4)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              Retirar
            </button>
            <button
              onClick={() => { setShowTransactionFormPayment(false); setShowTransactionFormBill(false); openTransferModal("between"); }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] w-full sm:flex-1 text-[#0ea5e9] hover:bg-[#0ea5e915] cursor-pointer"
              style={{ background: "rgba(14, 165, 233, 0.05)", border: "1px solid rgba(14, 165, 233, 0.4)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
              Transferir
            </button>
          </div>
        </div>
      )}

      {/* ══ NEW ACCOUNT FORM MODAL ══ */}
      {showNewAccountForm && (
        <Modal title="Crear Cuenta" onClose={() => { setShowNewAccountForm(false); setNewAccount({ name: "", alias: "" }); }}>
          <div className="px-5 py-5 flex flex-col gap-4">
            <div>
              <label className={labelCls}>Nombre *</label>
              <input
                type="text"
                placeholder="Nombre de la cuenta"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ name: e.target.value, alias: newAccount.alias })}
                autoFocus
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Alias (opcional)</label>
              <input
                type="text"
                placeholder="Alias"
                value={newAccount.alias}
                onChange={(e) => setNewAccount({ name: newAccount.name, alias: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowNewAccountForm(false); setNewAccount({ name: "", alias: "" }); }} className={`${btnSecondary} flex-1`}>
                Cancelar
              </button>
              <button onClick={handleAddAccount} className={`${btnPrimary} flex-1`} style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                Crear
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ INCOME FORM MODAL ══ */}
      {showTransactionFormPayment && (
        <Modal title="Crear Ingreso" onClose={() => setShowTransactionFormPayment(false)}>
          <form
            className="px-5 py-5 flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); handleCreateTransaction("ingreso"); }}
          >
            <div>
              <label className={labelCls}>Cuenta *</label>
              <select value={transactionPaymentData.accountId} onChange={(e) => setTransactionPaymentData({ ...transactionPaymentData, accountId: e.target.value })} required className={selectCls}>
                <option value="">Seleccionar cuenta...</option>
                {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Moto (opcional)</label>
              <select value={transactionPaymentData.motorBikeId} onChange={(e) => setTransactionPaymentData({ ...transactionPaymentData, motorBikeId: e.target.value })} className={selectCls}>
                <option value="">Sin moto</option>
                {motorBikes.map((bike) => <option key={bike.id} value={bike.id}>{bike.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Monto *</label>
              <input type="number" value={transactionPaymentData.amount} onChange={(e) => setTransactionPaymentData({ ...transactionPaymentData, amount: e.target.value })} min="1" required placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha *</label>
              <input type="date" value={transactionPaymentData.date} onChange={(e) => setTransactionPaymentData({ ...transactionPaymentData, date: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <input type="text" value={transactionPaymentData.description} onChange={(e) => setTransactionPaymentData({ ...transactionPaymentData, description: e.target.value })} maxLength={100} placeholder="Opcional..." className={inputCls} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowTransactionFormPayment(false)} className={`${btnSecondary} flex-1`}>Cancelar</button>
              <button type="submit" disabled={submittingTransaction} className={`${btnPrimary} flex-1`} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                {submittingTransaction ? <><Spinner />Guardando...</> : "Guardar ingreso"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ BILL FORM MODAL ══ */}
      {showTransactionFormBill && (
        <Modal title="Crear Egreso" onClose={() => setShowTransactionFormBill(false)}>
          <form
            className="px-5 py-5 flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); handleCreateTransaction("egreso"); }}
          >
            <div>
              <label className={labelCls}>Cuenta *</label>
              <select value={transactionBillData.accountId} onChange={(e) => setTransactionBillData({ ...transactionBillData, accountId: e.target.value })} required className={selectCls}>
                <option value="">Seleccionar cuenta...</option>
                {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Monto *</label>
              <input type="number" value={transactionBillData.amount} onChange={(e) => setTransactionBillData({ ...transactionBillData, amount: e.target.value })} min="1" required placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Categoría</label>
              <select value={transactionBillData.categoryId} onChange={(e) => setTransactionBillData({ ...transactionBillData, categoryId: e.target.value })} className={selectCls}>
                <option value="">Sin categoría</option>
                {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Fecha *</label>
              <input type="date" value={transactionBillData.date} onChange={(e) => setTransactionBillData({ ...transactionBillData, date: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <input type="text" value={transactionBillData.description} onChange={(e) => setTransactionBillData({ ...transactionBillData, description: e.target.value })} maxLength={100} placeholder="Opcional..." className={inputCls} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowTransactionFormBill(false)} className={`${btnSecondary} flex-1`}>Cancelar</button>
              <button type="submit" disabled={submittingTransaction} className={`${btnPrimary} flex-1`} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                {submittingTransaction ? <><Spinner />Guardando...</> : "Guardar egreso"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══ CALENDAR PROMPT MODAL ══ */}
      {showPromptCalendar && promptMotorBike && (
        <Modal title="Pago registrado" onClose={() => { setShowPromptCalendar(false); setPromptMotorBike(null); }}>
          <div className="px-5 py-6 flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div>
              <p className="m-0 text-[14px] font-semibold text-[#fafafa] mb-2">¿Actualizar calendario?</p>
              <p className="m-0 text-[14px] text-[#a1a1aa] leading-relaxed">
                ¿Deseas editar el calendario de <strong className="text-[#fafafa]">{promptMotorBike.name}</strong> para actualizar su estado de pago?
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => { setShowPromptCalendar(false); setPromptMotorBike(null); }} className={`${btnSecondary} flex-1`}>
                No, gracias
              </button>
              <button
                onClick={() => { setShowPromptCalendar(false); setShowCalendar(true); }}
                className={`${btnPrimary} flex-1`}
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}
              >
                Sí, editar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ CALENDAR ══ */}
      {showCalendar && promptMotorBike && (
        <CalendarioPagos
          motorBike={promptMotorBike}
          onClose={() => { setShowCalendar(false); setPromptMotorBike(null); loadData(); }}
        />
      )}

      {/* ══ TRANSFER MODAL ══ */}
      {showTransferModal && (
        <Modal
          title={
            transferMode === "save" ? "Añadir a Ahorros"
            : transferMode === "withdraw" ? "Sacar de Ahorros"
            : "Transferir entre Cuentas"
          }
          onClose={() => setShowTransferModal(false)}
        >
          <div className="px-5 py-5 flex flex-col gap-4">
            {/* Info banner */}
            <div
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-[14px] leading-relaxed"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 mt-0.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="text-[#fbbf24]">
                {transferMode === "save"
                  ? "El dinero se moverá desde tu cuenta de origen hacia la cuenta de Ahorros."
                  : transferMode === "withdraw"
                  ? "El dinero se moverá desde la cuenta de Ahorros hacia la cuenta destino."
                  : "El dinero se moverá entre las dos cuentas seleccionadas."}
              </span>
            </div>

            {/* Account selectors */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              {/* Origin */}
              <div>
                <label className={labelCls}>
                  {transferMode === "withdraw" ? "Origen (fijo)" : "Cuenta origen"}
                </label>
                {transferMode === "withdraw" ? (
                  <div className="px-3 py-2.5 rounded-lg text-[14px] font-semibold text-[#f59e0b]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    🏦 Ahorros
                  </div>
                ) : (
                  <select value={transferData.fromAccountId} onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })} required className={selectCls}>
                    <option value="">Seleccionar...</option>
                    {accounts.filter((a) => a.name !== "Ahorros").map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}{acc.alias ? ` (${acc.alias})` : ""}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pb-1 text-[#71717a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
              </div>

              {/* Destination */}
              <div>
                <label className={labelCls}>
                  {transferMode === "save" ? "Destino (fijo)" : "Cuenta destino"}
                </label>
                {transferMode === "save" ? (
                  <div className="px-3 py-2.5 rounded-lg text-[14px] font-semibold text-[#f59e0b]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    🏦 Ahorros
                  </div>
                ) : (
                  <select
                    value={transferData.toAccountId}
                    onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                    required
                    className={selectCls}
                  >
                    <option value="">Seleccionar...</option>
                    {accounts
                      .filter((a) => a.name !== "Ahorros" && (transferMode !== "between" || a.id.toString() !== transferData.fromAccountId))
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.name}{acc.alias ? ` (${acc.alias})` : ""}</option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            {/* No Ahorros warning */}
            {transferMode !== "between" && !accounts.find((a) => a.name === "Ahorros") && (
              <div className="px-3.5 py-3 rounded-xl text-[14px] text-[#fbbf24]" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                ⚠️ No encontramos una cuenta llamada <strong>"Ahorros"</strong>. Créala desde la sección de cuentas.
              </div>
            )}

            <div>
              <label className={labelCls}>Monto *</label>
              <input type="number" min="1" value={transferData.amount} onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })} placeholder="0" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha *</label>
              <input type="date" value={transferData.date} onChange={(e) => setTransferData({ ...transferData, date: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Descripción (opcional)</label>
              <input
                type="text"
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                placeholder={
                  transferMode === "save" ? "Ej: Ahorro de abril"
                  : transferMode === "withdraw" ? "Ej: Retiro para gastos"
                  : "Ej: Transferencia interna"
                }
                maxLength={100}
                className={inputCls}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowTransferModal(false)} className={`${btnSecondary} flex-1`}>Cancelar</button>
              <button
                onClick={handleCreateTransfer}
                disabled={submittingTransfer}
                className={`${btnPrimary} flex-1`}
                style={{
                  background:
                    transferMode === "save" ? "linear-gradient(135deg,#f59e0b,#d97706)"
                    : transferMode === "withdraw" ? "linear-gradient(135deg,#8b5cf6,#6d28d9)"
                    : "linear-gradient(135deg,#0ea5e9,#2563eb)",
                }}
              >
                {submittingTransfer ? (
                  <><Spinner />Procesando...</>
                ) : transferMode === "save" ? "Confirmar ahorro"
                  : transferMode === "withdraw" ? "Confirmar retiro"
                  : "Confirmar transferencia"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default BalanceView;

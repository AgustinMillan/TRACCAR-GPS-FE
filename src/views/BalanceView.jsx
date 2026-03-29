import { useState, useEffect } from "react";
import {
  getAllAccounts,
  createAccount,
  getAllPayments,
  updateAccount,
  createPayment,
  updatePayment,
} from "../services/balanceService";
import { getAllMotorBikes, getMotorBikeDebts } from "../services/motorBikeService";
import CalendarioPagos from "../components/Calendar";
import "./BalanceView.css";

function BalanceView() {
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState({
    accountId: "",
    motorBikeId: "",
    amount: "",
    type: "ingreso",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [submittingEditPayment, setSubmittingEditPayment] = useState(false);
  const [page, setPage] = useState(1);
  const [totalpages, setTotalPages] = useState(0);

  // States for filters
  const [filters, setFilters] = useState({
    motorBikeId: "",
    type: "ingreso", // empty = "Todos"
    startDate: "",
    endDate: "",
  });

  // States for calendar interaction after payment
  const [showPromptCalendar, setShowPromptCalendar] = useState(false);
  const [promptMotorBike, setPromptMotorBike] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleEditPayment = (payment) => {
    setEditPaymentId(payment.id);
    setEditPaymentData({
      accountId: payment.accountId?.toString() || "",
      motorBikeId: payment.motorBikeId?.toString() || "",
      amount: payment.amount?.toString() || "",
      type: payment.type || "ingreso",
      date: payment.date
        ? payment.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      description: payment.description || "",
    });
  };

  const handleUpdatePayment = async () => {
    if (
      !editPaymentData.accountId ||
      !editPaymentData.amount ||
      !editPaymentData.type ||
      !editPaymentData.date
    ) {
      setError("Cuenta, monto, tipo y fecha son obligatorios");
      return;
    }
    setSubmittingEditPayment(true);
    try {
      await updatePayment(editPaymentId, {
        accountId: Number(editPaymentData.accountId),
        motorBikeId: editPaymentData.motorBikeId
          ? Number(editPaymentData.motorBikeId)
          : null,
        amount: Number(editPaymentData.amount),
        type: editPaymentData.type,
        date: editPaymentData.date,
        description: editPaymentData.description,
      });
      setEditPaymentId(null);
      setEditPaymentData({
        accountId: "",
        motorBikeId: "",
        amount: "",
        type: "ingreso",
        date: new Date().toISOString().slice(0, 10),
        description: "",
      });
      await loadData();
    } catch (err) {
      setError(err.message || "Error al actualizar transacción");
    } finally {
      setSubmittingEditPayment(false);
    }
  };

  const [showTransactionFormPayment, setShowTransactionFormPayment] =
    useState(false);
  const [transactionPaymentData, setTransactionPaymentData] = useState({
    accountId: "",
    motorBikeId: "",
    amount: "",
    type: "ingreso",
    description: "",
  });

  const [showTransactionFormBill, setShowTransactionFormBill] = useState(false);
  const [transactionBillData, setTransactionBillData] = useState({
    accountId: "",
    amount: "",
    type: "egreso",
    description: "",
  });

  const [submittingTransaction, setSubmittingTransaction] = useState(false);
  const handleCreateTransaction = async (type) => {
    setSubmittingTransaction(true);
    try {
      if (type === "ingreso") {
        if (
          !transactionPaymentData.accountId ||
          !transactionPaymentData.amount
        ) {
          setError("Cuenta y monto son obligatorios");
          return;
        }
        await createPayment({
          accountId: Number(transactionPaymentData.accountId),
          motorBikeId: transactionPaymentData.motorBikeId
            ? Number(transactionPaymentData.motorBikeId)
            : null,
          amount: Number(transactionPaymentData.amount),
          type,
          date: transactionPaymentData.date,
          description: transactionPaymentData.description,
        });
        const pagoMotorBikeId = transactionPaymentData.motorBikeId;

        setShowTransactionFormPayment(false);
        setTransactionPaymentData({
          accountId: "",
          motorBikeId: "",
          amount: "",
          type: "ingreso",
          date: new Date().toISOString().slice(0, 10),
          description: "",
        });
        await loadData();

        if (pagoMotorBikeId) {
          const bike = motorBikes.find((b) => b.id.toString() === pagoMotorBikeId.toString());
          if (bike) {
            setPromptMotorBike(bike);
            setShowPromptCalendar(true);
          }
        }
      } else if (type === "egreso") {
        if (!transactionBillData.accountId || !transactionBillData.amount) {
          setError("Cuenta y monto son obligatorios");
          return;
        }
        await createPayment({
          accountId: Number(transactionBillData.accountId),
          amount: Number(transactionBillData.amount),
          type,
          date: transactionBillData.date,
          description: transactionBillData.description,
        });
        setShowTransactionFormBill(false);
        setTransactionBillData({
          accountId: "",
          amount: "",
          type: "egreso",
          date: new Date().toISOString().slice(0, 10),
          description: "",
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
  const [editAccountData, setEditAccountData] = useState({
    name: "",
    alias: "",
  });
  const handleEditAccount = (account) => {
    setEditAccountId(account.id);
    setEditAccountData({ name: account.name, alias: account.alias || "" });
  };

  const handleUpdateAccount = async () => {
    if (!editAccountData.name.trim()) {
      setError("El nombre de la cuenta no puede estar vacío");
      return;
    }
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

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
      .then(() => {
        console.log("Datos cargados correctamente");
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
      });
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Cargando cuentas, pagos y motos...");
      const [accountsData, paymentsData, bikesData, debtsData] =
        await Promise.all([
          getAllAccounts(),
          getAllPayments(page, setTotalPages, filters),
          getAllMotorBikes(),
          getMotorBikeDebts().catch(err => {
            console.error("Error al cargar deudas:", err);
            return { data: [] }; // Fallback
          })
        ]);
      setAccounts(accountsData);
      setPayments(paymentsData);
      setMotorBikes(bikesData);
      setDebtsReport(debtsData.data || []);
      console.log("Cuentas cargadas:", accountsData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.name.trim()) {
      setError("El nombre de la cuenta no puede estar vacío");
      return;
    }

    try {
      await createAccount({
        name: newAccount.name.trim(),
        alias: newAccount.alias.trim(),
      });
      setNewAccount({ name: "", alias: "" });
      setShowNewAccountForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Error al crear cuenta");
    }
  };

  const getMotorBikeName = (bikeId) => {
    const bike = motorBikes.find((b) => b.id === bikeId);
    return bike ? bike.name : "Desconocida";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return dateString;
  };

  return (
    <div className="balance-view">
      {/* Sección de error */}
      {error && (
        <div className="balance-error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sección de loading */}
      {loading && (
        <div className="balance-loading">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Sección de Resumen de Deudas */}
          <section className="debts-section" style={{ marginBottom: "2rem" }}>
            <h2>Resumen de Deudas</h2>
            {(() => {
              const motosConDeuda = debtsReport.filter(d => d.debt > 0);
              const totalDeuda = motosConDeuda.reduce((acc, curr) => acc + curr.debt, 0);

              if (motosConDeuda.length === 0) {
                return (
                  <div className="account-card" style={{ padding: "1.5rem", textAlign: "center", color: "#10b981", fontWeight: "bold" }}>
                    🎉 ¡Al día! Ninguna moto registra deudas pendientes.
                  </div>
                );
              }

              return (
                <div className="account-card" style={{ borderLeft: "4px solid #ef4444", padding: "1.5rem" }}>
                  <h3 style={{ color: "#ef4444", margin: "0 0 1rem 0", fontSize: "1.25rem" }}>
                    Tenemos {motosConDeuda.length} moto{motosConDeuda.length > 1 ? "s" : ""} adeudando un monto total de <strong>{formatCurrency(totalDeuda)}</strong>
                  </h3>
                  <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                    {motosConDeuda.map(moto => (
                      <div key={moto.id} style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px", color: "#6a88c5ff" }}>{moto.name}</div>
                        <div style={{ color: "#ef4444", fontWeight: "bold" }}>Deuda: {formatCurrency(moto.debt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Sección de Cuentas (Cards) */}
          <section className="accounts-section">
            <h2>Cuentas</h2>
            <div className="accounts-container">
              {/* Cards de cuentas existentes */}
              {accounts.map((account) => (
                <div key={account.id} className="account-card">
                  <div className="account-card-header">
                    {editAccountId === account.id ? (
                      <>
                        <input
                          type="text"
                          value={editAccountData.name}
                          onChange={(e) =>
                            setEditAccountData({
                              ...editAccountData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Nombre de la cuenta"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editAccountData.alias}
                          onChange={(e) =>
                            setEditAccountData({
                              ...editAccountData,
                              alias: e.target.value,
                            })
                          }
                          placeholder="Alias (opcional)"
                        />
                        <div className="form-actions">
                          <button
                            className="btn-confirm"
                            onClick={handleUpdateAccount}
                          >
                            Guardar
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => setEditAccountId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3>{account.name}</h3>
                        {account.alias && (
                          <div className="account-alias">{account.alias}</div>
                        )}
                        <button
                          className="btn-edit"
                          onClick={() => handleEditAccount(account)}
                          style={{ marginTop: 8 }}
                        >
                          Editar
                        </button>
                      </>
                    )}
                  </div>
                  <div className="account-card-body">
                    <div className="account-balance">
                      <span className="balance-label">Balance</span>
                      <span className="balance-amount">
                        {formatCurrency(account.balance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Card para agregar nueva cuenta */}
              <div className="account-card add-account-card">
                {!showNewAccountForm ? (
                  <button
                    className="add-account-btn"
                    onClick={() => setShowNewAccountForm(true)}
                    aria-label="Agregar nueva cuenta"
                  >
                    <span className="plus-icon">+</span>
                    <span>Nueva Cuenta</span>
                  </button>
                ) : (
                  <div className="new-account-form">
                    <input
                      type="text"
                      placeholder="Nombre de la cuenta"
                      value={newAccount.name}
                      onChange={(e) =>
                        setNewAccount({
                          name: e.target.value,
                          alias: newAccount.alias,
                        })
                      }
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Alias (opcional)"
                      value={newAccount.alias}
                      onChange={(e) =>
                        setNewAccount({
                          name: newAccount.name,
                          alias: e.target.value,
                        })
                      }
                    />

                    <div className="form-actions">
                      <button
                        className="btn-confirm"
                        onClick={handleAddAccount}
                      >
                        Crear
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setShowNewAccountForm(false);
                          setNewAccount({ name: "", alias: "" });
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sección de Pagos (Tabla) */}
          <section className="payments-section">
            <h2>Historial de Transacciones</h2>

            <div className="filters-container">
              <div className="filter-group">
                <label>Moto</label>
                <select value={filters.motorBikeId} onChange={(e) => setFilters({...filters, motorBikeId: e.target.value})}>
                  <option value="">Todas</option>
                  {motorBikes.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Tipo</label>
                <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                  <option value="ingreso">Ingresos</option>
                  <option value="egreso">Egresos</option>
                  <option value="">Todos</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Desde</label>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <div className="filter-group">
                <label>Hasta</label>
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>
              <div className="filter-group filter-actions">
                <button className="btn-filter" onClick={() => { setPage(1); loadData(); }}>
                  Aplicar Filtros
                </button>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="empty-state">
                <p>No hay pagos registrados</p>
              </div>
            ) : (
              <div className="payments-table-wrapper">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Monto</th>
                      <th>Tipo</th>
                      <th>Moto</th>
                      <th>Fecha</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className={`payment-row ${payment.type}`}
                      >
                        {editPaymentId === payment.id ? (
                          <td
                            colSpan={5}
                            style={{ background: "#f8fafc", padding: 0 }}
                          >
                            <form
                              className="transaction-form"
                              style={{
                                boxShadow: "none",
                                margin: 0,
                                padding: 0,
                              }}
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdatePayment();
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 12,
                                }}
                              >
                                <label
                                  style={{ flex: "1 1 120px", minWidth: 120 }}
                                >
                                  Cuenta
                                  <select
                                    value={editPaymentData.accountId}
                                    onChange={(e) =>
                                      setEditPaymentData({
                                        ...editPaymentData,
                                        accountId: e.target.value,
                                      })
                                    }
                                    required
                                  >
                                    <option value="">Seleccionar cuenta</option>
                                    {accounts.map((acc) => (
                                      <option key={acc.id} value={acc.id}>
                                        {acc.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label
                                  style={{ flex: "1 1 120px", minWidth: 120 }}
                                >
                                  Moto
                                  <select
                                    value={editPaymentData.motorBikeId}
                                    onChange={(e) =>
                                      setEditPaymentData({
                                        ...editPaymentData,
                                        motorBikeId: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="">Sin moto</option>
                                    {motorBikes.map((bike) => (
                                      <option key={bike.id} value={bike.id}>
                                        {bike.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label
                                  style={{ flex: "1 1 100px", minWidth: 100 }}
                                >
                                  Monto
                                  <input
                                    type="number"
                                    value={editPaymentData.amount}
                                    onChange={(e) =>
                                      setEditPaymentData({
                                        ...editPaymentData,
                                        amount: e.target.value,
                                      })
                                    }
                                    min="1"
                                    required
                                  />
                                </label>
                                <label
                                  style={{ flex: "1 1 140px", minWidth: 140 }}
                                >
                                  Fecha
                                  <input
                                    type="date"
                                    value={editPaymentData.date}
                                    onChange={(e) =>
                                      setEditPaymentData({
                                        ...editPaymentData,
                                        date: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </label>
                                <label
                                  style={{ flex: "2 1 180px", minWidth: 180 }}
                                >
                                  Descripción
                                  <input
                                    type="text"
                                    value={editPaymentData.description}
                                    onChange={(e) =>
                                      setEditPaymentData({
                                        ...editPaymentData,
                                        description: e.target.value,
                                      })
                                    }
                                    maxLength={100}
                                  />
                                </label>
                              </div>
                              <div
                                className="form-actions"
                                style={{ marginTop: 8 }}
                              >
                                <button
                                  className="btn-confirm"
                                  type="submit"
                                  disabled={submittingEditPayment}
                                >
                                  {submittingEditPayment
                                    ? "Guardando..."
                                    : "Guardar"}
                                </button>
                                <button
                                  className="btn-cancel"
                                  type="button"
                                  onClick={() => setEditPaymentId(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td className="amount-cell">
                              <span className={`amount ${payment.type}`}>
                                {payment.type === "ingreso" ? "+ " : "- "}
                                {formatCurrency(Math.abs(payment.amount))}
                              </span>
                            </td>
                            <td className="type-cell">
                              <span className={`type-badge ${payment.type}`}>
                                {payment.type === "ingreso"
                                  ? "Ingreso"
                                  : "Egreso"}
                              </span>
                            </td>
                            <td className="bike-cell">
                              {getMotorBikeName(payment.motorBikeId)}
                            </td>
                            <td className="date-cell">
                              {formatDate(payment.date)}
                            </td>
                            <td className="description-cell">
                              {payment.description || "-"}
                              <button
                                className="btn-edit-transaction"
                                onClick={() => handleEditPayment(payment)}
                              >
                                Editar
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div>
                  <button
                    onClick={() => {
                      if (page > 1) setPage(page - 1);
                    }}
                  >
                    -
                  </button>
                  <span style={{ margin: "0 8px", color: "#555" }}>
                    {page} / {totalpages}
                  </span>
                  <button
                    onClick={() => {
                      if (page < totalpages) setPage(page + 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </section>
          {/* Botones para crear transacción y cerrar formulario */}
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 16,
              justifyContent: "flex-end",
            }}
          >
            <div className="balance-action-footer">
              <button
                className="btn-income"
                onClick={() => {
                  setShowTransactionFormPayment(true);
                  setShowTransactionFormBill(false);
                }}
              >
                + CREAR INGRESO
              </button>
              <button
                className="btn-expense"
                onClick={() => {
                  setShowTransactionFormBill(true);
                  setShowTransactionFormPayment(false);
                }}
              >
                - CREAR EGRESO
              </button>
              {(showTransactionFormPayment || showTransactionFormBill) && (
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowTransactionFormPayment(false);
                    setShowTransactionFormBill(false);
                  }}
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>

          {/* Formulario para crear transacción */}
          {showTransactionFormPayment && (
            <div
              className="transaction-form"
              style={{
                marginTop: 24,
                background: "#f9f9f9",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 2px 8px #0001",
                maxWidth: 500,
              }}
            >
              <h3>Crear transacción</h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <form
                  className="transaction-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateTransaction("ingreso");
                  }}
                >
                  <h3>Crear transacción</h3>
                  <label>
                    Cuenta
                    <select
                      value={transactionPaymentData.accountId}
                      onChange={(e) =>
                        setTransactionPaymentData({
                          ...transactionPaymentData,
                          accountId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccionar cuenta</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Moto (opcional)
                    <select
                      value={transactionPaymentData.motorBikeId}
                      onChange={(e) =>
                        setTransactionPaymentData({
                          ...transactionPaymentData,
                          motorBikeId: e.target.value,
                        })
                      }
                    >
                      <option value="">Sin moto</option>
                      {motorBikes.map((bike) => (
                        <option key={bike.id} value={bike.id}>
                          {bike.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Monto
                    <input
                      type="number"
                      value={transactionPaymentData.amount}
                      onChange={(e) =>
                        setTransactionPaymentData({
                          ...transactionPaymentData,
                          amount: e.target.value,
                        })
                      }
                      min="1"
                      required
                    />
                  </label>
                  <label>
                    Fecha
                    <input
                      type="date"
                      value={transactionPaymentData.date}
                      onChange={(e) =>
                        setTransactionPaymentData({
                          ...transactionPaymentData,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Descripción
                    <input
                      type="text"
                      value={transactionPaymentData.description}
                      onChange={(e) =>
                        setTransactionPaymentData({
                          ...transactionPaymentData,
                          description: e.target.value,
                        })
                      }
                      maxLength={100}
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      className="btn-confirm"
                      type="submit"
                      disabled={submittingTransaction}
                    >
                      {submittingTransaction
                        ? "Guardando..."
                        : "Guardar transacción"}
                    </button>
                    <button
                      className="btn-cancel"
                      type="button"
                      onClick={() => setShowTransactionFormPayment(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Formulario para crear transacción (Egreso) */}
          {showTransactionFormBill && (          
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 16,
              justifyContent: "flex-end",
            }}
          >
            <div className="balance-action-footer">
              <button
                className="btn-confirm"
                onClick={() => setShowTransactionFormBill(true)}
              >
                Crear transacción
              </button>
              {showTransactionFormBill && (
                <button
                  className="btn-cancel"
                  onClick={() => setShowTransactionFormBill(false)}
                >
                  Cerrar formulario
                </button>
              )}
            </div>
          </div>)}

          {/* Formulario para crear transacción */}
          {showTransactionFormBill && (
            <div
              className="transaction-form"
              style={{
                marginTop: 24,
                background: "#f9f9f9",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 2px 8px #0001",
                maxWidth: 500,
              }}
            >
              <h3>Crear transacción</h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <form
                  className="transaction-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateTransaction("egreso");
                  }}
                >
                  <h3>Crear transacción</h3>
                  <label>
                    Cuenta
                    <select
                      value={transactionBillData.accountId}
                      onChange={(e) =>
                        setTransactionBillData({
                          ...transactionBillData,
                          accountId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Seleccionar cuenta</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Monto
                    <input
                      type="number"
                      value={transactionBillData.amount}
                      onChange={(e) =>
                        setTransactionBillData({
                          ...transactionBillData,
                          amount: e.target.value,
                        })
                      }
                      min="1"
                      required
                    />
                  </label>
                  <label>
                    Fecha
                    <input
                      type="date"
                      value={transactionBillData.date}
                      onChange={(e) =>
                        setTransactionBillData({
                          ...transactionBillData,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Descripción
                    <input
                      type="text"
                      value={transactionBillData.description}
                      onChange={(e) =>
                        setTransactionBillData({
                          ...transactionBillData,
                          description: e.target.value,
                        })
                      }
                      maxLength={100}
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      className="btn-confirm"
                      type="submit"
                      disabled={submittingTransaction}
                    >
                      {submittingTransaction
                        ? "Guardando..."
                        : "Guardar transacción"}
                    </button>
                    <button
                      className="btn-cancel"
                      type="button"
                      onClick={() => setShowTransactionFormBill(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Prompt para abrir calendario */}
          {showPromptCalendar && promptMotorBike && (
            <div className="calendar-overlay">
              <div className="day-modal">
                <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span>✓</span> Pago registrado
                </h4>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  ¿Deseas editar el calendario de la moto <strong style={{color: '#f3f4f6'}}>{promptMotorBike.name}</strong> para actualizar su estado?
                </p>
                <div className="modal-actions" style={{ marginTop: '1rem' }}>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowPromptCalendar(false);
                      setPromptMotorBike(null);
                    }}
                  >
                    No, gracias
                  </button>
                  <button
                    className="btn-save"
                    onClick={() => {
                      setShowPromptCalendar(false);
                      setShowCalendar(true);
                    }}
                  >
                    Sí, editar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Calendario real */}
          {showCalendar && promptMotorBike && (
            <CalendarioPagos
              motorBike={promptMotorBike}
              onClose={() => {
                setShowCalendar(false);
                setPromptMotorBike(null);
                loadData();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default BalanceView;

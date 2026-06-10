import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor, ingresa usuario y contraseña");
      return;
    }

    const success = login(username, password);

    if (success) {
      navigate("/");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-[#09090b]">
      {/* Animated background orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] animate-float pointer-events-none"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          top: "-150px",
          left: "-100px",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.08] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #818cf8 0%, transparent 70%)",
          bottom: "-100px",
          right: "-80px",
          animation: "float 10s infinite ease-in-out alternate-reverse",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#a1a1aa 1px, transparent 1px), linear-gradient(90deg, #a1a1aa 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] mx-4">
        <div
          className="rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
          style={{
            background: "rgba(24, 24, 27, 0.9)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Logo mark */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(99,102,241,0.4)]"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-[22px] font-bold text-[#fafafa] tracking-tight m-0 mb-1">Traccar GPS</h1>
            <p className="text-[14px] text-[#a1a1aa] m-0">Gestión de motos en tiempo real</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] text-[#fca5a5] animate-shake"
                style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            {/* Username field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[14px] font-semibold text-[#a1a1aa] uppercase tracking-wider pl-0.5">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] text-[#fafafa] placeholder:text-[#71717a] transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(9, 9, 11, 0.6)",
                    border: "1px solid #71717a",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid #6366f1";
                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid #71717a";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[14px] font-semibold text-[#a1a1aa] uppercase tracking-wider pl-0.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] text-[#fafafa] placeholder:text-[#71717a] transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(9, 9, 11, 0.6)",
                    border: "1px solid #71717a",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid #6366f1";
                    e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid #71717a";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer border-none mt-2 transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 20px rgba(99, 102, 241, 0.35)",
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 6px 28px rgba(99, 102, 241, 0.5)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 4px 20px rgba(99, 102, 241, 0.35)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Ingresar
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[14px] text-[#71717a] mt-6 m-0">
          Sistema de gestión de motos GPS
        </p>
      </div>
    </div>
  );
};

export default Login;

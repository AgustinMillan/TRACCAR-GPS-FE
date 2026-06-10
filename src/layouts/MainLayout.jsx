import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isMapView = location.pathname === "/map";

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full overflow-hidden relative bg-[#09090b]">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 py-0 pt-[env(safe-area-inset-top)] bg-[#09090b] border-b border-[#27272a] z-[100] shrink-0 h-[52px] mt-[env(safe-area-inset-top)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[#fafafa] tracking-tight hidden sm:block">Traccar GPS</span>
          <span className="text-[15px] font-semibold text-[#fafafa] tracking-tight sm:hidden">Traccar</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user?.username && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181b] border border-[#71717a]">
              <div className="w-4 h-4 rounded-full bg-[#6366f1] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="text-[14px] font-medium text-[#a1a1aa] max-w-[80px] truncate">{user.username}</span>
            </div>
          )}
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-[#ef4444] hover:bg-[#ef444415] transition-all duration-200 cursor-pointer border-none bg-transparent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden bg-[#09090b] touch-pan-y relative w-full min-h-0 ${
          isMapView
            ? "pb-0 overflow-hidden"
            : "pb-[calc(72px+env(safe-area-inset-bottom))]"
        }`}
      >
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default MainLayout;

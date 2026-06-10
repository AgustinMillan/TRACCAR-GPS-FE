import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    path: "/map",
    matchPath: "/map",
    label: "Mapa",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/motorcycles",
    matchPath: "/motorcycles",
    label: "Motos",
    icon: (active) => (
      <svg fill={active ? "currentColor" : "#a1a1aa"} stroke={active ? "none" : "currentColor"} strokeWidth="0" viewBox="0 0 256 256" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M216,120a41,41,0,0,0-6.6.55l-5.82-15.14A55.64,55.64,0,0,1,216,104a8,8,0,0,0,0-16H196.88L183.47,53.13A8,8,0,0,0,176,48H144a8,8,0,0,0,0,16h26.51l9.23,24H152c-18.5,0-33.5,4.31-43.37,12.46a16,16,0,0,1-16.76,2.07c-10.58-4.81-73.29-30.12-73.8-30.26a8,8,0,0,0-5,15.19S68.57,109.4,79.6,120.4A55.67,55.67,0,0,1,95.43,152H79.2a40,40,0,1,0,0,16h52.12a31.91,31.91,0,0,0,30.74-23.1,56,56,0,0,1,26.59-33.72l5.82,15.13A40,40,0,1,0,216,120ZM40,168H62.62a24,24,0,1,1,0-16H40a8,8,0,0,0,0,16Zm176,16a24,24,0,0,1-15.58-42.23l8.11,21.1a8,8,0,1,0,14.94-5.74L215.35,136l.65,0a24,24,0,0,1,0,48Z"></path></svg>
    ),
  },
  {
    path: "/balance",
    matchPath: "/balance",
    label: "Balance",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: "/reports",
    matchPath: "/reports",
    label: "Reportes",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed w-fit bottom-6 left-0 right-0 z-[1000] mx-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Blur backdrop */}
      <div className="glass border-t rounded-full border-[#27272a] px-6 pt-2 pb-2">
        <div className="flex justify-around gap-x-3 items-center max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.matchPath;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 px-3 rounded-xl
                  transition-all duration-200 cursor-pointer border-none touch-manipulation
                  [-webkit-tap-highlight-color:transparent]
                  ${active
                    ? "bg-[#6366f120] text-[#818cf8]"
                    : "text-[#a1a1aa] hover:text-[#a1a1aa] hover:bg-[#18181b] bg-transparent"
                  }
                `}
                aria-label={item.label}
              >
                <span className={`transition-transform duration-200 ${active ? "scale-110" : "scale-100"}`}>
                  {item.icon(active)}
                </span>
                <span className={`text-[14px] font-medium leading-none transition-all duration-200 ${active ? "opacity-100" : "opacity-60"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNavigation;

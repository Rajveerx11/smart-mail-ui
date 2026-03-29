import { Inbox, Send, AlertCircle, Pencil, ShieldAlert } from "lucide-react";
import { useMailStore } from "../store/mailStore";

const items = [
  { name: "Inbox", icon: Inbox },
  { name: "Sent", icon: Send },
  { name: "Spam", icon: AlertCircle },
  { name: "Quarantine", icon: ShieldAlert }, // ← NEW
];

export default function Sidebar() {
  const {
    activeFolder,
    setFolder,
    openCompose,
    isSidebarOpen,
    mails,
  } = useMailStore();

  // Count quarantined emails for badge
  const quarantineCount = mails.filter(m => m.quarantine_status === true).length;

  return (
    <aside
      className={`bg-white border-r transition-all duration-300 shadow-sm
      ${isSidebarOpen ? "w-64" : "w-20"} flex-shrink-0 flex flex-col`}
    >
      {/* COMPOSE BUTTON */}
      <div className="p-4 mb-2">
        <button
          onClick={openCompose}
          className={`flex items-center gap-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100
          ${isSidebarOpen ? "px-6 py-4 w-full" : "p-4 justify-center"}`}
        >
          <Pencil size={20} />
          {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-widest">Compose</span>}
        </button>
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeFolder === item.name;
          const isQuarantine = item.name === "Quarantine";

          return (
            <div
              key={item.name}
              onClick={() => setFolder(item.name)}
              className={`flex items-center gap-4 cursor-pointer rounded-xl transition-all
                ${isSidebarOpen ? "px-4 py-3" : "p-4 justify-center"}
                ${isActive
                  ? isQuarantine
                    ? "bg-red-50 text-red-700 font-bold"
                    : "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
              `}
              title={!isSidebarOpen ? item.name : ""}
            >
              <Icon
                size={20}
                className={isActive
                  ? isQuarantine ? "text-red-600" : "text-indigo-600"
                  : "text-slate-400"}
              />

              {isSidebarOpen && <span className="text-sm">{item.name}</span>}

              {/* Inbox pulse dot */}
              {isSidebarOpen && item.name === "Inbox" && (
                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 shadow-sm animate-pulse" />
              )}

              {/* Quarantine count badge */}
              {isSidebarOpen && isQuarantine && quarantineCount > 0 && (
                <div className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {quarantineCount}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

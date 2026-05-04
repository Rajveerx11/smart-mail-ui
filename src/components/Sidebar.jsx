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

  const quarantineCount = mails.filter(m => m.quarantine_status === true).length;
  const counts = {
    Inbox: mails.filter((m) => m.folder === "Inbox" && m.quarantine_status !== true).length,
    Sent: mails.filter((m) => m.folder === "Sent").length,
    Spam: mails.filter((m) => m.folder === "Spam" && m.quarantine_status !== true).length,
    Quarantine: quarantineCount,
  };

  return (
    <aside
      className={`bg-[#f8fafc] border-r border-slate-200 transition-all duration-300
      ${isSidebarOpen ? "w-64" : "w-20"} flex-shrink-0 flex flex-col`}
    >
      <div className="px-3 py-4">
        <button
          onClick={openCompose}
          className={`flex items-center gap-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm
          ${isSidebarOpen ? "px-5 py-3 w-full" : "p-3 justify-center"}`}
        >
          <Pencil size={18} />
          {isSidebarOpen && <span className="font-semibold text-sm">Compose</span>}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="px-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Mailbox</p>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeFolder === item.name;
          const isQuarantine = item.name === "Quarantine";

          return (
            <div
              key={item.name}
              onClick={() => setFolder(item.name)}
              className={`group flex items-center gap-3 cursor-pointer rounded-lg transition-all
                ${isSidebarOpen ? "px-3 py-2.5" : "p-3 justify-center"}
                ${isActive
                  ? isQuarantine
                    ? "bg-red-50 text-red-700 font-semibold"
                    : "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"}
              `}
              title={!isSidebarOpen ? item.name : ""}
            >
              <Icon
                size={20}
                className={isActive
                  ? isQuarantine ? "text-red-600" : "text-blue-600"
                  : "text-slate-400 group-hover:text-slate-600"}
              />

              {isSidebarOpen && (
                <>
                  <span className="text-sm flex-1">{item.name}</span>
                  {counts[item.name] > 0 && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      isQuarantine
                        ? "bg-red-100 text-red-700"
                        : isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-200/70 text-slate-500"
                    }`}>
                      {counts[item.name]}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {isSidebarOpen && (
        <div className="px-5 py-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>Protection</span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}

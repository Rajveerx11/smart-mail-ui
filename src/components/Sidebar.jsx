import { Inbox, Send, AlertCircle, Pencil } from "lucide-react";
import { useMailStore } from "../store/mailStore";

const items = [
  { name: "Inbox", icon: Inbox },
  { name: "Sent", icon: Send },
  { name: "Spam", icon: AlertCircle },
];

export default function Sidebar() {
  const {
    isSidebarOpen,
    setActiveFolder,
    openCompose,
  } = useMailStore();

  return (
    <aside
      className={`bg-white border-r transition-all duration-300
      ${isSidebarOpen ? "w-56" : "w-16"} flex-shrink-0`}
    >
      {/* COMPOSE */}
      <div className="p-2">
        <button
          onClick={openCompose}
          className={`flex items-center gap-3 rounded-full bg-blue-100 hover:bg-blue-200 transition
          ${isSidebarOpen ? "px-4 py-3 w-full" : "p-3 justify-center"}`}
        >
          <Pencil size={18} />
          {isSidebarOpen && <span>Compose</span>}
        </button>
      </div>

      {/* MENU */}
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.name}
            onClick={() => setActiveFolder(item.name)}
            className={`flex items-center gap-4 cursor-pointer hover:bg-gray-100
            ${isSidebarOpen ? "px-4 py-2" : "p-3 justify-center"}`}
            title={!isSidebarOpen ? item.name : ""}
          >
            <Icon size={18} />
            {isSidebarOpen && <span>{item.name}</span>}
          </div>
        );
      })}
    </aside>
  );
}

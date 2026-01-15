import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  AlertCircle,
  Menu,
} from "lucide-react";
import { useMailStore } from "../store/mailStore";

const items = [
  { icon: Inbox, label: "Inbox" },
  { icon: Star, label: "Starred" },
  { icon: Clock, label: "Snoozed" },
  { icon: Send, label: "Sent" },
  { icon: FileText, label: "Drafts" },
  { icon: AlertCircle, label: "Spam" },
];

export default function IconNavbar() {
  const expanded = useMailStore((state) => state.isIconNavExpanded);
  const toggle = useMailStore((state) => state.toggleIconNav);

  return (
    <div
      className={`bg-white border-r h-full transition-all duration-300
        ${expanded ? "w-56" : "w-16"}`}
    >
      {/* Toggle Button */}
      <div className="flex justify-center py-4">
        <Menu
          onClick={toggle}
          className="cursor-pointer text-gray-700 hover:bg-gray-200 p-1 rounded"
        />
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-2 px-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer
                hover:bg-blue-100 text-gray-700`}
            >
              <Icon size={20} />
              {expanded && (
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

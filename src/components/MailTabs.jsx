import { Inbox, Tag, Users, Info } from "lucide-react";
import { useMailStore } from "../store/mailStore";

const tabs = [
  { name: "Primary", icon: Inbox },
  { name: "Promotions", icon: Tag },
  { name: "Social", icon: Users },
  { name: "Updates", icon: Info },
];

export default function MailTabs() {
  const activeFolder = useMailStore((s) => s.activeFolder);
  const activeCategory = useMailStore((s) => s.activeCategory);
  const setActiveCategory = useMailStore((s) => s.setActiveCategory);
  const mails = useMailStore((s) => s.mails);

  // Tabs only show when viewing the Inbox
  if (activeFolder !== "Inbox") return null;

  return (
    <div className="border-b border-slate-200 bg-white flex px-3 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.name}
          onClick={() => setActiveCategory(t.name)}
          className={`min-w-[150px] px-4 py-3 border-b-2 flex items-center gap-2 transition-all ${activeCategory === t.name
              ? "border-blue-600 text-blue-700 bg-blue-50/50 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
        >
          <t.icon size={16} className={activeCategory === t.name ? "text-blue-600" : "text-slate-400"} />
          <span className="text-xs uppercase tracking-wider">{t.name}</span>
          <span className="ml-auto text-[11px] text-slate-400">
            {mails.filter((m) => m.folder === "Inbox" && (m.category || "Primary") === t.name && m.quarantine_status !== true && !m.read_status).length}
          </span>
        </button>
      ))}
    </div>
  );
}

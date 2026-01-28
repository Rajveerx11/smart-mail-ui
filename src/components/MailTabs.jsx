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

  // Tabs only show when viewing the Inbox
  if (activeFolder !== "Inbox") return null;

  return (
    <div className="border-b bg-white flex px-2">
      {tabs.map((t) => (
        <div
          key={t.name}
          onClick={() => setActiveCategory(t.name)}
          className={`px-8 py-4 cursor-pointer border-b-2 flex items-center transition-all ${activeCategory === t.name
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
        >
          <t.icon size={16} className={`mr-2 ${activeCategory === t.name ? "text-indigo-600" : "text-gray-400"}`} />
          <span className="text-xs uppercase tracking-widest">{t.name}</span>
        </div>
      ))}
    </div>
  );
}
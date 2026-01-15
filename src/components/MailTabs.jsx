import { Inbox, Tag, Users, Info } from "lucide-react";
import { useMailStore } from "../store/mailStore";

const tabs = [
  { name: "Primary", icon: Inbox },
  { name: "Promotions", icon: Tag },
  { name: "Social", icon: Users },
  { name: "Updates", icon: Info },
];

export default function MailTabs() {
  const { activeFolder, activeCategory, setActiveCategory } =
    useMailStore();

  if (activeFolder !== "Inbox") return null;

  return (
    <div className="border-b bg-white flex">
      {tabs.map((t) => (
        <div
          key={t.name}
          onClick={() => setActiveCategory(t.name)}
          className={`px-6 py-3 cursor-pointer border-b-2 ${
            activeCategory === t.name
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600"
          }`}
        >
          <t.icon size={16} className="inline mr-2" />
          {t.name}
        </div>
      ))}
    </div>
  );
}

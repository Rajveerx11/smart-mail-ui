import MailItem from "./MailItem";
import { useMailStore } from "../store/mailStore";
import { useMemo } from "react";

export default function MailList() {
  const mails = useMailStore((s) => s.mails);
  const activeFolder = useMailStore((s) => s.activeFolder);
  const activeCategory = useMailStore((s) => s.activeCategory);
  const searchText = useMailStore((s) => s.searchText);

  const filteredMails = useMemo(() => {
    return mails.filter((m) => {
      // 1️⃣ folder match
      if (m.folder !== activeFolder) return false;

      // 2️⃣ inbox → category match
      if (activeFolder === "Inbox") {
        if (m.category !== activeCategory) return false;
      }

      // 3️⃣ search
      if (searchText) {
        const text = `${m.from} ${m.subject} ${m.body}`.toLowerCase();
        if (!text.includes(searchText.toLowerCase())) return false;
      }

      return true;
    });
  }, [mails, activeFolder, activeCategory, searchText]);

  /* ✅ EMPTY STATE → FULL CENTER, NO BORDER */
  if (filteredMails.length === 0) {
  return (
     <div className="w-[380px] bg-white flex items-center justify-center">
      <div
        className="absolute top-28 left-1/2 -translate-x-1/2
                   text-gray-400 text-sm flex items-center gap-2"
      >
        📭 No mails found
      </div>
    </div>
  );
}


  /* ✅ NORMAL MAIL LIST */
  return (
    <div className="w-[380px] border-r overflow-y-auto bg-white">
      {filteredMails.map((m) => (
        <MailItem key={m.id} mail={m} />
      ))}
    </div>
  );
}

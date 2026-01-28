import { useEffect } from "react";
import { useMailStore } from "../store/mailStore";

export default function MailList() {
  const mails = useMailStore((s) => s.mails);
  const activeFolder = useMailStore((s) => s.activeFolder);
  const activeCategory = useMailStore((s) => s.activeCategory);
  const searchText = useMailStore((s) => s.searchText);
  const fetchMails = useMailStore((s) => s.fetchMails);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const selectedMail = useMailStore((s) => s.selectedMail);

  useEffect(() => {
    fetchMails();
  }, [fetchMails]);

  // Combined Filter: Folder -> Category -> Search
  const filteredMails = mails.filter((m) => {
    // 1. Folder check (Inbox, Sent, etc.)
    if (m.folder !== activeFolder) return false;

    // 2. Category check (Only if we are in the Inbox)
    if (activeFolder === "Inbox") {
      // If the email has no category, it defaults to 'Primary'
      const mailCat = m.category || "Primary";
      if (mailCat !== activeCategory) return false;
    }

    // 3. Search text check
    if (searchText) {
      const textStr = `${m.sender} ${m.subject} ${m.body}`.toLowerCase();
      if (!textStr.includes(searchText.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white">
      {filteredMails.length === 0 ? (
        <div className="p-8 text-center text-gray-500 italic">No messages found in {activeCategory}.</div>
      ) : (
        filteredMails.map((mail) => (
          <div
            key={mail.id}
            className={`border-b hover:bg-gray-50 cursor-pointer p-5 transition-all ${selectedMail?.id === mail.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
              }`}
            onClick={() => setSelectedMail(mail)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-bold ${!mail.read_status ? 'text-slate-900' : 'text-slate-500'}`}>
                {mail.sender}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date(mail.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-sm text-gray-800 font-medium truncate">{mail.subject || "(No Subject)"}</div>
            <div className="text-xs text-gray-500 truncate mt-1">
              {mail.body === "⚠️ Retrieval pending..." ? (
                <span className="text-indigo-400 italic">Fetching content...</span>
              ) : (
                mail.body?.slice(0, 100)
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
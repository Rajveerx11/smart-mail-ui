import { useEffect } from "react";
import { useMailStore } from "../store/mailStore";

export default function MailList() {
  const mails = useMailStore((s) => s.mails);
  const activeFolder = useMailStore((s) => s.activeFolder);
  const searchText = useMailStore((s) => s.searchText);
  const fetchMails = useMailStore((s) => s.fetchMails);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const selectedMail = useMailStore((s) => s.selectedMail);

  useEffect(() => {
    fetchMails();
  }, [fetchMails]);

  // Derived state: Filter locally to avoid infinite loops from store selector returning new references
  const filteredMails = mails.filter((m) => {
    // Basic folder routing
    if (m.folder !== activeFolder) return false;

    // Real-time search filter
    if (searchText) {
      const textStr = `${m.sender} ${m.subject} ${m.body}`.toLowerCase();
      if (!textStr.includes(searchText.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white">
      {filteredMails.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No messages found.</div>
      ) : (
        filteredMails.map((mail) => (
          <div
            key={mail.id}
            className={`border-b hover:bg-gray-100 cursor-pointer p-4 transition-colors ${selectedMail?.id === mail.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            onClick={() => setSelectedMail(mail)}
          >
            <div className={`font-semibold ${!mail.read_status ? 'text-gray-900' : 'text-gray-600'}`}>
              {mail.sender}
            </div>
            <div className="text-sm text-gray-600 truncate">{mail.subject}</div>
            <div className="text-xs text-gray-400 truncate mt-1">{mail.body?.slice(0, 80)}...</div>
          </div>
        ))
      )}
    </div>
  );
}
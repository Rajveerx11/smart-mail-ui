import { useEffect } from "react";
import { useMailStore } from "../store/mailStore";
// Import any other UI components you use here (e.g., MailItem)

// 1. ADD 'default' TO THE FUNCTION DEFINITION
export default function MailList() {
  const mails = useMailStore((s) => s.mails);
  const activeFolder = useMailStore((s) => s.activeFolder);
  const searchText = useMailStore((s) => s.searchText);
  const fetchMails = useMailStore((s) => s.fetchMails);

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
          <div key={mail.id} className="border-b hover:bg-gray-50 cursor-pointer p-4">
            {/* Replace this with your actual MailItem component or markup */}
            <div className="font-semibold">{mail.sender}</div>
            <div className="text-sm text-gray-600">{mail.subject}</div>
          </div>
        ))
      )}
    </div>
  );
}
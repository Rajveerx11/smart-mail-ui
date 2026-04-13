import { useEffect, useRef } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailList() {
  const mails = useMailStore((s) => s.mails);
  const activeFolder = useMailStore((s) => s.activeFolder);
  const activeCategory = useMailStore((s) => s.activeCategory);
  const searchText = useMailStore((s) => s.searchText);
  const fetchMails = useMailStore((s) => s.fetchMails);
  const subscribeToMails = useMailStore((s) => s.subscribeToMails);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const selectedMail = useMailStore((s) => s.selectedMail);
  const autoScanMail = useMailStore((s) => s.autoScanMail);

  const hasFetched = useRef(false);
  const scannedIds = useRef(new Set());

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMails();
      const unsubscribe = subscribeToMails();
      hasFetched.current = true;
      return () => unsubscribe();
    }
  }, [fetchMails, subscribeToMails]);

  // ✅ FIXED: Auto-scan new incoming emails
  useEffect(() => {
    mails.forEach((mail) => {
      if (
        mail.folder === "Inbox" &&
        mail.phishing_score === null   // ✅ changed
      ) {
        if (!scannedIds.current.has(mail.id)) {
          scannedIds.current.add(mail.id);
          autoScanMail(mail);
        }
      }
    });
  }, [mails]);

  // Derived state: Combined Filter
  const filteredMails = mails.filter((m) => {
    // Quarantine folder — show only quarantined emails
    if (activeFolder === "Quarantine") {
      return m.quarantine_status === true;
    }

    // All other folders — never show quarantined emails
    if (m.quarantine_status === true) return false;

    // ✅ NEW: hide unscanned mails in Inbox
    if (activeFolder === "Inbox" && m.phishing_score === null) {
      return false;
    }

    // Folder check
    if (m.folder !== activeFolder) return false;

    // Category check (Inbox only)
    if (activeFolder === "Inbox") {
      const mailCat = m.category || "Primary";
      if (mailCat !== activeCategory) return false;
    }

    // Search check
    if (searchText) {
      const textStr = `${m.sender} ${m.subject} ${m.body}`.toLowerCase();
      if (!textStr.includes(searchText.toLowerCase())) return false;
    }

    return true;
  });

  const getRiskColor = (score) => {
    if (!score) return null;
    if (score >= 80) return "text-red-600 bg-red-50 border-red-200";
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    if (score >= 35) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return null;
  };

  return (
    <div className="w-[400px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300">

      {/* Quarantine header banner */}
      {activeFolder === "Quarantine" && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-600" />
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
            Auto-Quarantined Emails
          </span>
        </div>
      )}

      {filteredMails.length === 0 ? (
        <div className="p-8 text-center text-gray-500 italic">
          {activeFolder === "Quarantine"
            ? "🛡️ No quarantined emails. Your inbox is safe!"
            : `No messages found in ${activeCategory}.`}
        </div>
      ) : (
        filteredMails.map((mail) => (
          <div
            key={mail.id}
            className={`border-b hover:bg-gray-50 cursor-pointer p-5 transition-all ${
              selectedMail?.id === mail.id
                ? activeFolder === "Quarantine"
                  ? "bg-red-50 border-l-4 border-l-red-600"
                  : "bg-indigo-50 border-l-4 border-l-indigo-600"
                : ""
            }`}
            onClick={() => setSelectedMail(mail)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-bold ${!mail.read_status ? "text-slate-900" : "text-slate-500"}`}>
                {mail.sender}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date(mail.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="text-sm text-gray-800 font-medium truncate">
              {mail.subject || "(No Subject)"}
            </div>

            <div className="text-xs text-gray-500 truncate mt-1">
              {mail.body === "⚠️ Retrieval pending..." ? (
                <span className="text-indigo-400 italic font-medium animate-pulse">Syncing content...</span>
              ) : (
                mail.body?.slice(0, 100)
              )}
            </div>

            {/* Phishing score badge */}
            {mail.phishing_score && (
              <div className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(mail.phishing_score)}`}>
                <ShieldAlert size={10} />
                {mail.phishing_score}/100 · {mail.quarantine_status ? "QUARANTINED" : "SUSPICIOUS"}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

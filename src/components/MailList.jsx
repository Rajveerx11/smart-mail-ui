import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailList() {
  const mails = useMailStore((s) => s.mails);
  const activeFolder = useMailStore((s) => s.activeFolder);
  const activeCategory = useMailStore((s) => s.activeCategory);
  const searchText = useMailStore((s) => s.searchText);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const selectedMail = useMailStore((s) => s.selectedMail);

  const filteredMails = mails.filter((m) => {
    if (activeFolder === "Quarantine") {
      return m.quarantine_status === true;
    }

    if (m.quarantine_status === true) return false;
    if (m.folder !== activeFolder) return false;

    if (activeFolder === "Inbox") {
      const mailCat = m.category || "Primary";
      if (mailCat !== activeCategory) return false;
    }

    if (searchText) {
      const textStr = `${m.sender} ${m.subject} ${m.body}`.toLowerCase();
      if (!textStr.includes(searchText.toLowerCase())) return false;
    }

    return true;
  });

  const getRiskColor = (score) => {
    if (score === null || score === undefined) return "";
    if (score >= 80) return "text-red-700 bg-red-50 border-red-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    if (score >= 35) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  const formatListDate = (value) => {
    const date = new Date(value);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (Number.isNaN(date.getTime())) return "";
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <section className="w-[clamp(340px,30vw,420px)] min-w-[340px] flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-all duration-300">
      {activeFolder === "Quarantine" && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-600" />
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Auto-Quarantined Emails
          </span>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-5 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              {activeFolder === "Inbox" ? activeCategory : activeFolder}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredMails.length} {filteredMails.length === 1 ? "message" : "messages"}
            </p>
          </div>
          {searchText && (
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded-md truncate max-w-[150px]">
              Search active
            </span>
          )}
        </div>
      </div>

      {filteredMails.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <div className="mx-auto mb-3 h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ShieldCheck size={18} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            {activeFolder === "Quarantine" ? "No quarantined emails" : "No messages found"}
          </p>
          <p className="text-xs mt-1">
            {activeFolder === "Quarantine"
              ? "Your inbox is clear right now."
              : `${activeFolder === "Inbox" ? activeCategory : activeFolder} is empty.`}
          </p>
        </div>
      ) : (
        filteredMails.map((mail) => (
          <div
            key={mail.id}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer px-5 py-4 transition-all ${
              selectedMail?.id === mail.id
                ? activeFolder === "Quarantine"
                  ? "bg-red-50/80 shadow-[inset_3px_0_0_#dc2626]"
                  : "bg-blue-50/80 shadow-[inset_3px_0_0_#2563eb]"
                : "shadow-[inset_3px_0_0_transparent]"
            }`}
            onClick={() => setSelectedMail(mail)}
          >
            <div className="flex justify-between items-start gap-3 mb-1">
              <span className={`text-sm truncate ${!mail.read_status ? "font-semibold text-slate-950" : "font-medium text-slate-600"}`}>
                {mail.sender}
              </span>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                {formatListDate(mail.created_at)}
              </span>
            </div>

            <div className="text-[15px] text-slate-900 font-medium truncate">
              {mail.subject || "(No Subject)"}
            </div>

            <div className="text-sm text-slate-500 truncate mt-1 leading-5">
              {mail.body === "Retrieval pending..." ? (
                <span className="text-blue-500 font-medium animate-pulse">Syncing content...</span>
              ) : (
                mail.body?.slice(0, 100)
              )}
            </div>

            {mail.phishing_score !== null && mail.phishing_score !== undefined && (
              <div className={`inline-flex items-center gap-1 mt-3 text-[11px] font-semibold px-2 py-1 rounded-md border ${getRiskColor(mail.phishing_score)}`}>
                {mail.quarantine_status ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                {mail.phishing_score}/100 {mail.quarantine_status ? "Quarantined" : "Scanned"}
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}

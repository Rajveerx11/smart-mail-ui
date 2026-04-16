import { useEffect, useState } from "react";
import {
  Archive,
  Check,
  Copy,
  Download,
  Eye,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useMailStore, supabase } from "../store/mailStore";

const RISK = {
  safe: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Safe",
    icon: ShieldCheck,
  },
  suspicious: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
    label: "Suspicious",
    icon: ShieldAlert,
  },
  phishing: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Phishing",
    icon: ShieldAlert,
  },
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Critical",
    icon: ShieldAlert,
  },
};

const riskFromScore = (score) => {
  if (score === null || score === undefined) return null;
  if (score >= 80) return RISK.critical;
  if (score >= 60) return RISK.phishing;
  if (score >= 35) return RISK.suspicious;
  return RISK.safe;
};

const formatMessageDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSenderInitial = (sender) => {
  if (!sender) return "?";
  return sender.trim().charAt(0).toUpperCase();
};

function AssistantSection({ title, children }) {
  return (
    <section className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h4>
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        {children}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="max-w-sm text-center px-8">
        <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Sparkles size={22} />
        </div>
        <h2 className="text-lg font-semibold text-slate-950">Select a message</h2>
        <p className="mt-2 text-sm text-slate-500 leading-6">
          Choose an email from the list to read it, summarize it, or run a security check.
        </p>
      </div>
    </div>
  );
}

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);
  const releaseMail = useMailStore((s) => s.releaseMail);
  const deleteMail = useMailStore((s) => s.deleteMail);

  const [copied, setCopied] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(null);
  const [viewingAttachment, setViewingAttachment] = useState(null);
  const [phishResult, setPhishResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [mailAction, setMailAction] = useState(null);

  useEffect(() => {
    setPhishResult(null);
    setCopied(false);
    setMailAction(null);
  }, [selectedMail?.id]);

  if (!selectedMail) return <EmptyState />;

  const attachments = selectedMail.attachments;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  const storedRisk = riskFromScore(selectedMail.phishing_score);
  const activeRisk = phishResult?.risk_level
    ? RISK[phishResult.risk_level] || RISK.safe
    : storedRisk;
  const RiskIcon = activeRisk?.icon || ShieldCheck;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDetectPhishing = async () => {
    setIsScanning(true);
    setPhishResult(null);

    try {
      const res = await fetch("https://axon-phishing-backend.onrender.com/api/phishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: selectedMail.sender || "",
          subject: selectedMail.subject || "",
          body: selectedMail.body || "",
        }),
      });
      const data = await res.json();
      setPhishResult(data);
    } catch {
      setPhishResult({ error: "Could not connect to phishing detector" });
    } finally {
      setIsScanning(false);
    }
  };

  const getSignedUrl = async (path) => {
    const { data, error } = await supabase.storage
      .from("email-attachments")
      .createSignedUrl(path, 3600);

    if (error) {
      console.error("Failed to create signed URL:", error);
      throw new Error(error.message);
    }

    return data.signedUrl;
  };

  const handleDownloadAttachment = async (attachment) => {
    setDownloadingAttachment(attachment.filename);

    try {
      const url = await getSignedUrl(attachment.storage_path);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to download attachment");
    } finally {
      setDownloadingAttachment(null);
    }
  };

  const handleViewAttachment = async (attachment) => {
    setViewingAttachment(attachment.filename);

    try {
      const url = await getSignedUrl(attachment.storage_path);
      window.open(url, "_blank");
    } catch {
      alert("Failed to open attachment");
    } finally {
      setViewingAttachment(null);
    }
  };

  const handleReleaseMail = async () => {
    setMailAction("release");
    await releaseMail(selectedMail.id);
    setMailAction(null);
  };

  const handleDeleteMail = async () => {
    setMailAction("delete");
    await deleteMail(selectedMail.id);
    setMailAction(null);
  };

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden bg-white">
      <article className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 lg:px-10 pt-8 pb-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    {selectedMail.folder || "Inbox"}
                  </span>
                  {activeRisk && (
                    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold border ${activeRisk.bg} ${activeRisk.border} ${activeRisk.text}`}>
                      {selectedMail.phishing_score ?? phishResult?.score}/100 security score
                    </span>
                  )}
                </div>
                <h1 className="text-2xl lg:text-[28px] font-semibold tracking-tight text-slate-950 leading-tight break-words">
                  {selectedMail.subject || "(No Subject)"}
                </h1>
              </div>

              <button
                className="h-9 w-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center shrink-0"
                aria-label="More options"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0">
                  {selectedMail.sender ? getSenderInitial(selectedMail.sender) : <User size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-semibold text-slate-950 truncate">
                      {selectedMail.sender || "Unknown sender"}
                    </span>
                    <span className="hidden md:inline text-xs text-slate-500 truncate">
                      &lt;{selectedMail.sender || "unknown"}&gt;
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">to me</p>
                </div>
              </div>

              <time className="text-right text-xs font-medium text-slate-500 shrink-0">
                {formatMessageDate(selectedMail.created_at)}
              </time>
            </div>

            {selectedMail.quarantine_status && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2 text-sm text-red-700">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">This message is quarantined</p>
                    {selectedMail.quarantine_reason && (
                      <p className="text-xs mt-1 text-red-600">{selectedMail.quarantine_reason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReleaseMail}
                    disabled={mailAction !== null}
                    className="h-9 rounded-lg bg-white px-3 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-2"
                  >
                    {mailAction === "release" ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
                    Release
                  </button>
                  <button
                    onClick={handleDeleteMail}
                    disabled={mailAction !== null}
                    className="h-9 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 flex items-center gap-2"
                  >
                    {mailAction === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 lg:px-10 py-8">
            <div className="max-w-3xl text-[15px] leading-7 text-slate-800 whitespace-pre-wrap break-words">
              {selectedMail.body || "No message body available."}
            </div>
          </div>

          {hasAttachments && (
            <div className="px-8 lg:px-10 py-6 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Paperclip size={14} />
                Attachments ({attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-w-4xl">
                {attachments.map((att, index) => (
                  <div key={index} className="group bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-2">
                          <Paperclip size={15} />
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate" title={att.filename}>
                          {att.filename}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {att.size ? `${(att.size / 1024).toFixed(0)} KB` : "Attachment"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAttachment(att);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Preview"
                        >
                          {viewingAttachment === att.filename ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAttachment(att);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Download"
                        >
                          {downloadingAttachment === att.filename ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-16" />
        </div>
      </article>

      <aside className="hidden xl:flex w-[340px] flex-shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-[#f8fafc]">
        <div className="px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={17} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-950">AI Assistant</h3>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              Ready
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <AssistantSection title="Summary">
            {!selectedMail.summary ? (
              <button
                onClick={() => generateAISummary(selectedMail.id)}
                disabled={isAnalyzing}
                className="w-full h-10 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                Generate summary
              </button>
            ) : (
              <div>
                <p className="text-sm text-slate-700 leading-6">
                  {selectedMail.summary}
                </p>
                <button
                  onClick={() => generateAISummary(selectedMail.id)}
                  disabled={isAnalyzing}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Sparkles size={12} /> Regenerate
                </button>
              </div>
            )}
          </AssistantSection>

          <AssistantSection title="Smart Reply">
            {!selectedMail.ai_draft ? (
              <button
                onClick={() => generateAIDraft(selectedMail.id)}
                disabled={isAnalyzing}
                className="w-full h-10 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
                Draft reply
              </button>
            ) : (
              <div className="relative group">
                <p className="text-sm text-slate-700 leading-6 pr-7">
                  {selectedMail.ai_draft}
                </p>
                <button
                  onClick={() => handleCopy(selectedMail.ai_draft)}
                  className="absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                  title="Copy"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => generateAIDraft(selectedMail.id)}
                  disabled={isAnalyzing}
                  className="mt-3 text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <MessageSquare size={12} /> Try another
                </button>
              </div>
            )}
          </AssistantSection>

          <AssistantSection title="Phishing Detection">
            {activeRisk && !phishResult?.error && (
              <div className={`mb-3 rounded-lg border p-3 ${activeRisk.bg} ${activeRisk.border}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <RiskIcon size={16} className={activeRisk.text} />
                    <span className={`text-sm font-semibold ${activeRisk.text}`}>
                      {activeRisk.label}
                    </span>
                  </div>
                  <span className={`text-lg font-semibold ${activeRisk.text}`}>
                    {phishResult?.score ?? selectedMail.phishing_score}
                    <span className="text-[11px] font-medium opacity-60">/100</span>
                  </span>
                </div>
              </div>
            )}

            {!phishResult && selectedMail.phishing_score == null && (
              <p className="mb-3 text-xs text-slate-500 leading-5">
                Run a live scan before opening links or attachments.
              </p>
            )}

            {phishResult?.error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {phishResult.error}
              </div>
            )}

            {phishResult?.reasons?.length > 0 && activeRisk && (
              <ul className="space-y-2 mb-3">
                {phishResult.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-slate-600 leading-5">
                    <span className={`mt-2 h-1.5 w-1.5 rounded-full ${activeRisk.dot} shrink-0`} />
                    {reason}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={handleDetectPhishing}
              disabled={isScanning}
              className="w-full h-10 rounded-lg border border-red-200 bg-white text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <ShieldAlert size={15} />
                  {phishResult || selectedMail.phishing_score != null ? "Run scan again" : "Detect phishing"}
                </>
              )}
            </button>
          </AssistantSection>
        </div>
      </aside>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Sparkles, MessageSquare, Loader2, Copy, Check, Paperclip, Download, Eye, Calendar, Clock, User, CornerUpLeft, MoreVertical, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMailStore, supabase } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);
  const releaseMail = useMailStore((s) => s.releaseMail);
  const deleteMail = useMailStore((s) => s.deleteMail);
  const activeFolder = useMailStore((s) => s.activeFolder);

  const [copied, setCopied] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(null);
  const [viewingAttachment, setViewingAttachment] = useState(null);

  // ── Phishing Detection State ──────────────────────────────
  const [phishResult, setPhishResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Phishing Detection Handler ────────────────────────────
  const handleDetectPhishing = async () => {
    if (!selectedMail) return;
    setIsScanning(true);
    setPhishResult(null);
    try {
      const res = await fetch("http://localhost:5000/api/phishing", {
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
    } catch (err) {
      setPhishResult({ error: "Could not connect to phishing detector" });
    } finally {
      setIsScanning(false);
    }
  };

  // Reset phishing result when selected mail changes
  useEffect(() => {
    setPhishResult(null);
  }, [selectedMail?.id]);


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
    } catch (err) {
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
    } catch (err) {
      alert("Failed to open attachment");
    } finally {
      setViewingAttachment(null);
    }
  };

  // ── Phishing risk config ──────────────────────────────────
  const RISK = {
    safe:       { bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", label: "Safe",       icon: <ShieldCheck size={14} /> },
    suspicious: { bg: "bg-yellow-50",   border: "border-yellow-200",  text: "text-yellow-700",  badge: "bg-yellow-100 text-yellow-700",  label: "Suspicious", icon: <ShieldAlert size={14} /> },
    phishing:   { bg: "bg-orange-50",   border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-100 text-orange-700",  label: "Phishing",   icon: <ShieldAlert size={14} /> },
    critical:   { bg: "bg-red-50",      border: "border-red-200",     text: "text-red-700",     badge: "bg-red-100 text-red-700",        label: "Critical",   icon: <ShieldAlert size={14} /> },
  };

  if (!selectedMail) return (
    <div className="flex-1 flex items-center justify-center text-slate-400 bg-white">
      <div className="text-center">
        <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium">Select a conversation to begin</p>
      </div>
    </div>
  );

  const attachments = selectedMail.attachments;
  const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;
  const dateObj = new Date(selectedMail.created_at);
  const riskConfig = phishResult?.risk_level ? RISK[phishResult.risk_level] || RISK.safe : null;

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* MAIN EMAIL COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {/* HEADER */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                {selectedMail.subject || "(No Subject)"}
              </h1>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider">
                  Inbox
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {selectedMail.sender?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-900 text-[15px]">{selectedMail.sender}</span>
                    <span className="text-xs text-slate-500">&lt;{selectedMail.sender}&gt;</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">to me</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 font-medium">
                {dateObj.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* QUARANTINE BANNER */}
          {selectedMail.quarantine_status && (
            <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={16} className="text-red-600" />
                <span className="text-sm font-bold text-red-700">This email was Auto-Quarantined</span>
                <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Score: {selectedMail.phishing_score}/100
                </span>
              </div>
              {selectedMail.quarantine_reason && (
                <ul className="mb-3 space-y-1">
                  {selectedMail.quarantine_reason.split(" | ").map((r, i) => (
                    <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => releaseMail(selectedMail.id)}
                  className="flex-1 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                >
                  ✓ Release to Inbox
                </button>
                <button
                  onClick={() => deleteMail(selectedMail.id)}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  ✕ Delete Permanently
                </button>
              </div>
            </div>
          )}

          {/* BODY */}
          <div className="px-8 py-4 text-slate-800 leading-relaxed whitespace-pre-wrap text-[15px]">
            {selectedMail.body}
          </div>

          {/* ATTACHMENTS */}
          {hasAttachments && (
            <div className="px-8 py-8 mt-4 border-t border-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Paperclip size={14} />
                Attachments ({attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attachments.map((att, index) => (
                  <div key={index} className="group relative bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-white rounded border border-slate-100 text-slate-400">
                        <Paperclip size={16} />
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewAttachment(att); }}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Preview"
                        >
                          {viewingAttachment === att.filename ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadAttachment(att); }}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Download"
                        >
                          {downloadingAttachment === att.filename ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate pr-2" title={att.filename}>{att.filename}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {att.size ? (att.size / 1024).toFixed(0) + ' KB' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-20" />
        </div>
      </div>

      {/* AI SIDEBAR — unchanged structure, phishing section added at bottom */}
      <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col flex-shrink-0 z-10 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">AI Assistant</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* SUMMARY SECTION — unchanged */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Summary</h4>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              {!selectedMail.summary ? (
                <button
                  onClick={() => generateAISummary(selectedMail.id)}
                  disabled={isAnalyzing}
                  className="w-full py-2 rounded-lg border border-dashed border-indigo-300 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate Summary
                </button>
              ) : (
                <div>
                  <p className="text-[13px] text-slate-600 leading-relaxed italic mb-3">
                    "{selectedMail.summary}"
                  </p>
                  <button
                    onClick={() => generateAISummary(selectedMail.id)}
                    disabled={isAnalyzing}
                    className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <Sparkles size={10} /> Regenerate
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* DRAFT SECTION — unchanged */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Smart Reply</h4>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              {!selectedMail.ai_draft ? (
                <button
                  onClick={() => generateAIDraft(selectedMail.id)}
                  disabled={isAnalyzing}
                  className="w-full py-2 rounded-lg border border-dashed border-emerald-300 text-emerald-600 text-xs font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                  Draft Reply
                </button>
              ) : (
                <div className="relative group">
                  <p className="text-[13px] text-slate-600 leading-relaxed pr-6">
                    {selectedMail.ai_draft}
                  </p>
                  <button
                    onClick={() => handleCopy(selectedMail.ai_draft)}
                    className="absolute top-0 right-0 p-1.5 text-slate-300 hover:text-emerald-600 transition-colors"
                    title="Copy"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => generateAIDraft(selectedMail.id)}
                      disabled={isAnalyzing}
                      className="text-[10px] text-emerald-500 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <MessageSquare size={10} /> Try Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── PHISHING DETECTION SECTION ── */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phishing Detection</h4>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">

              {/* Scan button — shown when no result yet */}
              {!phishResult && (
                <button
                  onClick={handleDetectPhishing}
                  disabled={isScanning}
                  className="w-full py-2 rounded-lg border border-dashed border-red-300 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isScanning
                    ? <><Loader2 size={14} className="animate-spin" /> Scanning...</>
                    : <><ShieldAlert size={14} /> Detect Phishing</>
                  }
                </button>
              )}

              {/* Error state */}
              {phishResult?.error && (
                <div className="text-[12px] text-red-500 text-center py-1">
                  {phishResult.error}
                  <button
                    onClick={handleDetectPhishing}
                    className="block mx-auto mt-2 text-[10px] text-red-400 hover:text-red-600 font-semibold"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Result */}
              {phishResult && !phishResult.error && riskConfig && (
                <div>
                  {/* Score + badge */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${riskConfig.bg} ${riskConfig.border} border mb-3`}>
                    <div className="flex items-center gap-2">
                      <span className={riskConfig.text}>{riskConfig.icon}</span>
                      <span className={`text-xs font-bold ${riskConfig.text}`}>
                        {riskConfig.label}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${riskConfig.text}`}>
                      {phishResult.score}<span className="text-[10px] font-normal opacity-60">/100</span>
                    </span>
                  </div>

                  {/* Reasons list */}
                  {phishResult.reasons?.length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {phishResult.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${riskConfig.text.replace("text-", "bg-")}`} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Rescan button */}
                  <button
                    onClick={handleDetectPhishing}
                    disabled={isScanning}
                    className={`text-[10px] font-semibold flex items-center gap-1 ${riskConfig.text} opacity-70 hover:opacity-100`}
                  >
                    <ShieldAlert size={10} /> Rescan
                  </button>
                </div>
              )}

            </div>
          </section>
          {/* ── END PHISHING SECTION ── */}

        </div>
      </aside>
    </div>
  );
}

import { useState } from "react";
import { Sparkles, MessageSquare, Loader2, Copy, Check, Paperclip, Download } from "lucide-react";
import { useMailStore, supabase } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);

  const [copied, setCopied] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAttachment = async (attachment) => {
    setDownloadingAttachment(attachment.filename);
    try {
      // Generate signed URL for download (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from("email-attachments")
        .createSignedUrl(attachment.storage_path, 3600);

      if (error) {
        console.error("Failed to create signed URL:", error);
        alert("Failed to download attachment");
        return;
      }

      // Trigger browser download
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download attachment");
    } finally {
      setDownloadingAttachment(null);
    }
  };

  if (!selectedMail) return (
    <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
      <div className="text-center">
        <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium">Select a conversation to begin</p>
      </div>
    </div>
  );

  const attachments = selectedMail.attachments;
  const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* MAIN EMAIL COLUMN */}
      <div className="flex-1 overflow-y-auto px-12 py-10 border-r border-slate-100">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            {selectedMail.subject || "(No Subject)"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {selectedMail.sender?.[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{selectedMail.sender}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                {new Date(selectedMail.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </header>

        <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[15px] whitespace-pre-wrap">
          {selectedMail.body}
        </article>

        {/* ATTACHMENTS SECTION */}
        {hasAttachments && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Attachments ({attachments.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {attachments.map((att, index) => (
                <button
                  key={index}
                  onClick={() => handleDownloadAttachment(att)}
                  disabled={downloadingAttachment === att.filename}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm text-slate-700 hover:text-indigo-700 transition-all group"
                >
                  {downloadingAttachment === att.filename ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} className="text-slate-400 group-hover:text-indigo-500" />
                  )}
                  <span className="max-w-[200px] truncate">{att.filename}</span>
                  {att.size && (
                    <span className="text-xs text-slate-400">
                      ({(att.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI SIDEBAR (Antigravity Style) */}
      <aside className="w-80 bg-slate-50/50 p-6 overflow-y-auto space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-indigo-600" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">AI Assistant</h3>
        </div>

        {/* SUMMARY SECTION */}
        <section className="space-y-3">
          <button
            onClick={() => generateAISummary(selectedMail.id)}
            disabled={isAnalyzing}
            className="w-full py-2.5 rounded-xl border border-indigo-200 bg-white text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {selectedMail.summary ? "Regenerate Summary" : "Generate Summary"}
          </button>

          {selectedMail.summary && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <p className="text-[13px] text-slate-600 leading-relaxed italic">
                {selectedMail.summary}
              </p>
            </div>
          )}
        </section>

        {/* DRAFT SECTION */}
        <section className="space-y-3">
          <button
            onClick={() => generateAIDraft(selectedMail.id)}
            disabled={isAnalyzing}
            className="w-full py-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-600 text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            AI Smart Reply
          </button>

          {selectedMail.ai_draft && (
            <div className="group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-8">
              <button
                onClick={() => handleCopy(selectedMail.ai_draft)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {selectedMail.ai_draft}
              </p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

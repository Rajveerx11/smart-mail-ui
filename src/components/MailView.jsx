import { useState } from "react";
import { Sparkles, MessageSquare, Loader2, Copy, Check, Paperclip, Download, Eye, Calendar, Clock, User } from "lucide-react";
import { useMailStore, supabase } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);

  const [copied, setCopied] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(null);
  const [viewingAttachment, setViewingAttachment] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Helper to get a signed URL for an attachment.
   * Default expiry: 1 hour (3600 seconds)
   */
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

      // Trigger browser download
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
  const dateObj = new Date(selectedMail.created_at);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50/50">
      {/* MAIN EMAIL COLUMN */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* HEADER CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-6">
              {selectedMail.subject || "(No Subject)"}
            </h1>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              {/* Sender Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-inner">
                  {selectedMail.sender?.[0]?.toUpperCase() || <User size={20} />}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">{selectedMail.sender}</p>
                  <p className="text-xs text-slate-400 font-medium">To: Me</p>
                </div>
              </div>

              {/* Date Info */}
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                  <Calendar size={14} />
                  <span>{dateObj.toLocaleDateString([], { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={12} />
                  <span>{dateObj.toLocaleTimeString([], { timeStyle: 'short' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EMAIL BODY CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 min-h-[300px] mb-8 relative">
            <div className="prose prose-slate max-w-none text-slate-700 leading-7 text-[15px] whitespace-pre-wrap font-normal">
              {selectedMail.body}
            </div>
          </div>

          {/* ATTACHMENTS SECTION */}
          {hasAttachments && (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 px-2">
                <Paperclip size={18} className="text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Attachments ({attachments.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((att, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all group flex items-start gap-4">
                    {/* File Icon / Preview Placeholder */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 mt-1">
                      <Paperclip size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate mb-1" title={att.filename}>
                        {att.filename}
                      </p>
                      <p className="text-xs text-slate-400 mb-3">
                        {att.size ? `${(att.size / 1024).toFixed(0)} KB` : 'Unknown Size'}
                      </p>

                      <div className="flex items-center gap-2">
                        {/* VIEW ACTION */}
                        <button
                          onClick={() => handleViewAttachment(att)}
                          disabled={viewingAttachment === att.filename}
                          className="flex-1 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {viewingAttachment === att.filename ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Eye size={12} />
                          )}
                          View
                        </button>

                        {/* DOWNLOAD ACTION */}
                        <button
                          onClick={() => handleDownloadAttachment(att)}
                          disabled={downloadingAttachment === att.filename}
                          className="flex-1 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {downloadingAttachment === att.filename ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Download size={12} />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI SIDEBAR */}
      <aside className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-8 flex-shrink-0 z-10 shadow-[low_-5px_0px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Sparkles size={18} className="text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800">AI Assistant</h3>
        </div>

        {/* SUMMARY SECTION */}
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Smart Summary</h4>

          <button
            onClick={() => generateAISummary(selectedMail.id)}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl border border-indigo-200 bg-indigo-50/50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 group"
          >
            {isAnalyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="group-hover:scale-110 transition-transform" />
            )}
            {selectedMail.summary ? "Regenerate Summary" : "Generate Summary"}
          </button>

          {selectedMail.summary && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-right-4">
              <p className="text-[13px] text-slate-600 leading-relaxed italic">
                "{selectedMail.summary}"
              </p>
            </div>
          )}
        </section>

        {/* DRAFT SECTION */}
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Quick Reply</h4>

          <button
            onClick={() => generateAIDraft(selectedMail.id)}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 group"
          >
            {isAnalyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MessageSquare size={14} className="group-hover:scale-110 transition-transform" />
            )}
            Draft Smart Reply
          </button>

          {selectedMail.ai_draft && (
            <div className="group relative bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-right-8">
              <button
                onClick={() => handleCopy(selectedMail.ai_draft)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white text-slate-400 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"
                title="Copy to clipboard"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
              <p className="text-[13px] text-slate-600 leading-relaxed pr-2">
                {selectedMail.ai_draft}
              </p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}

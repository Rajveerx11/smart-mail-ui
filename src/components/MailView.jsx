import { useState, useEffect } from "react";
import { Sparkles, MessageSquare, Loader2, Copy, Check } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);

  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedMail) return (
    <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
      <div className="text-center">
        <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium">Select a conversation to begin</p>
      </div>
    </div>
  );

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
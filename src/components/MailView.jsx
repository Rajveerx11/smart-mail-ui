import { useState, useEffect } from "react";
import { Sparkles, Send, Loader2, MessageSquare } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const openCompose = useMailStore((s) => s.openCompose);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);

  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  if (!selectedMail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-slate-50 to-slate-100">
        <Sparkles size={48} className="mb-4 text-gray-300" />
        <p>Select an email to explore AI insights</p>
      </div>
    );
  }

  // Check all possible fields for the body
  const displayBody = selectedMail.body || selectedMail.Body || selectedMail.text || selectedMail.html || "No message content available.";

  return (
    <div className="flex-1 p-10 bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{selectedMail.subject || "(No Subject)"}</h2>
        <p className="text-sm text-gray-600 mt-2">From: {selectedMail.sender || selectedMail.from || "Unknown"}</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={() => generateAISummary(selectedMail.id)} disabled={isAnalyzing} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 transition-all">
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Summarize
        </button>
        <button onClick={() => generateAIDraft(selectedMail.id)} disabled={isAnalyzing} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50 transition-all">
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
          AI Reply
        </button>
      </div>

      {selectedMail.summary && (
        <div className="mb-6 bg-white border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
          <h4 className="font-bold mb-2 text-indigo-700 text-xs uppercase tracking-widest">AI Summary</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{selectedMail.summary}</p>
        </div>
      )}

      {selectedMail.ai_draft && (
        <div className="mb-6 bg-white border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm">
          <h4 className="font-bold mb-2 text-emerald-700 text-xs uppercase tracking-widest">AI Draft</h4>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap italic">"{selectedMail.ai_draft}"</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[200px]">
        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{displayBody}</div>
      </div>
    </div>
  );
}
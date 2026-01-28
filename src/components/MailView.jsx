import { useState, useEffect } from "react";
import { Sparkles, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const openCompose = useMailStore((s) => s.openCompose);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);

  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  // Auto-reset reply box when switching emails
  useEffect(() => {
    setShowReplyBox(false);
    setReply("");
  }, [selectedMail?.id]);

  if (!selectedMail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-slate-50 to-slate-100">
        <Sparkles size={48} className="mb-4 text-gray-300" />
        <p className="font-medium">Select an email to explore AI insights</p>
      </div>
    );
  }

  /**
   * ROBUST BODY RESOLUTION
   * Logic: 
   * 1. Check direct 'body' column
   * 2. Check nested 'raw_json' from the Resend Webhook
   * 3. Check text/html fallbacks
   */
  const displayBody =
    selectedMail.body ||
    selectedMail.raw_json?.data?.text ||
    selectedMail.raw_json?.data?.html ||
    selectedMail.text ||
    selectedMail.html ||
    null;

  const isBodyMissing = !displayBody || displayBody === "Body content missing from webhook payload";

  return (
    <div className="flex-1 p-10 bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">

      {/* EMAIL HEADER */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {selectedMail.subject || "(No Subject)"}
          </h2>
          {isBodyMissing && (
            <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
              <AlertCircle size={12} /> Payload Missing Content
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          From: <span className="font-semibold text-gray-800">{selectedMail.sender || selectedMail.from || "Unknown Sender"}</span>
        </p>
      </div>

      {/* AI ACTION STRIP */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => generateAISummary(selectedMail.id)}
          disabled={isAnalyzing || isBodyMissing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {selectedMail.summary ? "Update Summary" : "Summarize"}
        </button>

        <button
          onClick={() => generateAIDraft(selectedMail.id)}
          disabled={isAnalyzing || isBodyMissing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
          AI Reply
        </button>
      </div>

      {/* AI INSIGHTS SECTION */}
      <div className="space-y-4 mb-8">
        {selectedMail.summary && (
          <div className="bg-white border-l-4 border-indigo-500 p-6 rounded-r-2xl shadow-sm animate-in slide-in-from-left duration-300">
            <h4 className="font-bold mb-2 text-indigo-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> AI Executive Summary
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMail.summary}
            </p>
          </div>
        )}

        {selectedMail.ai_draft && (
          <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-r-2xl shadow-sm animate-in slide-in-from-left duration-500">
            <h4 className="font-bold mb-2 text-emerald-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} /> Suggested AI Response
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{selectedMail.ai_draft}"
            </p>
            <button
              onClick={() => { setReply(selectedMail.ai_draft); setShowReplyBox(true); }}
              className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-800 underline uppercase tracking-tighter"
            >
              Copy to reply box
            </button>
          </div>
        )}
      </div>

      {/* MAIN EMAIL CONTENT */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[300px]">
        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {isBodyMissing ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic">
              <AlertCircle size={32} className="mb-2 opacity-20" />
              <p>This message contains no text content.</p>
              <p className="text-[10px] mt-1 not-italic">Check raw_json in database for metadata.</p>
            </div>
          ) : (
            displayBody
          )}
        </div>
      </div>

      {/* QUICK REPLY BOX */}
      {showReplyBox && (
        <div className="mt-6 bg-white border border-indigo-100 p-6 rounded-3xl shadow-xl animate-in zoom-in-95 duration-200">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border-none rounded-2xl p-4 text-sm text-gray-800 mb-4 focus:ring-0 outline-none bg-slate-50 min-h-[150px]"
            placeholder="Type your reply..."
          />
          <div className="flex gap-2">
            <button onClick={() => { openCompose(); setShowReplyBox(false); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-100">
              Send Now
            </button>
            <button onClick={() => setShowReplyBox(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-8 py-2.5 rounded-full text-xs font-bold transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
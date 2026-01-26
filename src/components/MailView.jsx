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

  // Debug: Check exactly what the data object looks like in the browser console
  useEffect(() => {
    if (selectedMail) {
      console.log("DEBUG: Current Selected Mail Object:", selectedMail);
    }
  }, [selectedMail]);

  if (!selectedMail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-slate-50 to-slate-100">
        <Sparkles size={48} className="mb-4 text-gray-300" />
        <p>Select an email to explore AI insights</p>
      </div>
    );
  }

  /**
   * ROBUST BODY RESOLUTION:
   * We check every possible key that might contain the message body 
   * to fix the "No content available" issue.
   */
  const displayBody =
    selectedMail.body ||       // Standard lowercase
    selectedMail.Body ||       // Capitalized (Supabase default sometimes)
    selectedMail.text ||       // Resend raw text
    selectedMail.html ||       // Resend raw HTML
    selectedMail.content ||    // Alternative name
    "No message content available in the database.";

  /* ===== AI SUMMARY ===== */
  const handleSummarize = async () => {
    try {
      await generateAISummary(selectedMail.id);
    } catch (error) {
      console.error("Summarization failed:", error);
    }
  };

  /* ===== AI DRAFT ===== */
  const handleGenerateDraft = async () => {
    try {
      await generateAIDraft(selectedMail.id);
    } catch (error) {
      console.error("Draft generation failed:", error);
    }
  };

  /* ===== LOCAL SMART REPLY ===== */
  const generateLocalReply = () => {
    const replies = [
      "Thanks for the update.",
      "Noted, I'll review.",
      "Received with thanks.",
      "Appreciate the information.",
    ];
    setReply(replies[Math.floor(Math.random() * replies.length)]);
    setShowReplyBox(true);
  };

  return (
    <div className="flex-1 p-10 bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {selectedMail.subject || "(No Subject)"}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-gray-600">
            From: <span className="font-medium">{selectedMail.sender || selectedMail.from || "Unknown"}</span>
          </p>

          {/* CATEGORY BADGE */}
          {selectedMail.category && (
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${selectedMail.category === "Unprocessed"
                ? "bg-gray-200 text-gray-700"
                : selectedMail.category === "Work"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}>
              {selectedMail.category}
            </span>
          )}
        </div>
      </div>

      {/* ===== AI ACTION BUTTONS ===== */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={handleSummarize}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {selectedMail.summary ? "Update Summary" : "Summarize with AI"}
        </button>

        <button
          onClick={handleGenerateDraft}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
          {selectedMail.ai_draft ? "Regenerate Reply" : "Generate AI Reply"}
        </button>

        <button
          onClick={generateLocalReply}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition-all"
        >
          <Send size={16} />
          Quick Reply
        </button>
      </div>

      {/* ===== AI SUMMARY DISPLAY ===== */}
      {selectedMail.summary && (
        <div className="mb-6 bg-white border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-left-2">
          <h4 className="font-bold mb-2 text-indigo-700 flex items-center gap-2 text-xs uppercase tracking-widest">
            <Sparkles size={14} />
            AI Summary
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">{selectedMail.summary}</p>
        </div>
      )}

      {/* ===== AI DRAFT DISPLAY ===== */}
      {selectedMail.ai_draft && (
        <div className="mb-6 bg-white border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-left-2">
          <h4 className="font-bold mb-2 text-emerald-700 flex items-center gap-2 text-xs uppercase tracking-widest">
            <MessageSquare size={14} />
            AI Draft Reply
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-4 italic">
            "{selectedMail.ai_draft}"
          </p>
          <button
            onClick={() => {
              setReply(selectedMail.ai_draft);
              setShowReplyBox(true);
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline uppercase"
          >
            Edit and use this draft
          </button>
        </div>
      )}

      {/* ===== EMAIL BODY ===== */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 min-h-[200px]">
        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {displayBody}
        </div>
      </div>

      {/* ===== REPLY BOX ===== */}
      {reply && showReplyBox && (
        <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-xl animate-in zoom-in-95">
          <h4 className="font-bold mb-4 text-blue-700 text-xs uppercase tracking-widest flex items-center gap-2">
            <Send size={14} />
            Your Response
          </h4>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border border-gray-100 rounded-xl p-4 text-sm text-gray-800 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
            rows={5}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                openCompose();
                setShowReplyBox(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-xs font-bold transition-all"
            >
              Confirm & Send
            </button>
            <button
              onClick={() => setShowReplyBox(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-6 py-2 rounded-full text-xs font-bold transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
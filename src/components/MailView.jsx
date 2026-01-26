import { useState } from "react";
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

  /* ===== AI SUMMARY (from backend) ===== */
  const handleSummarize = async () => {
    try {
      await generateAISummary(selectedMail.id);
    } catch (error) {
      console.error("Summarization failed:", error);
    }
  };

  /* ===== AI DRAFT (from backend) ===== */
  const handleGenerateDraft = async () => {
    try {
      await generateAIDraft(selectedMail.id);
    } catch (error) {
      console.error("Draft generation failed:", error);
    }
  };

  /* ===== LOCAL SMART REPLY (demo) ===== */
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
      <h2 className="text-2xl font-semibold text-gray-900">
        {selectedMail.subject}
      </h2>
      <div className="flex items-center gap-2 mb-6 mt-1">
        <p className="text-sm text-gray-600">
          From: {selectedMail.from || selectedMail.sender}
        </p>

        {/* CATEGORY BADGE */}
        {selectedMail.category && (
          <span className={`text-xs px-2 py-0.5 rounded ${selectedMail.category === "Unprocessed"
            ? "bg-gray-100 text-gray-600"
            : selectedMail.category === "Work"
              ? "bg-blue-100 text-blue-700"
              : selectedMail.category === "Personal"
                ? "bg-purple-100 text-purple-700"
                : selectedMail.category === "Social"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
            }`}>
            {selectedMail.category}
          </span>
        )}
      </div>

      {/* ===== AI ACTION BUTTONS ===== */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={handleSummarize}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full
          bg-gradient-to-r from-purple-500 to-indigo-500
          text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {selectedMail.summary ? "Re-Summarize" : "Summarize with AI"}
            </>
          )}
        </button>

        <button
          onClick={handleGenerateDraft}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full
          bg-gradient-to-r from-emerald-500 to-teal-500
          text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <MessageSquare size={16} />
              {selectedMail.ai_draft ? "Regenerate AI Reply" : "Generate AI Reply"}
            </>
          )}
        </button>

        <button
          onClick={generateLocalReply}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full
          bg-gradient-to-r from-blue-500 to-cyan-500
          text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Send size={16} />
          Quick Reply
        </button>
      </div>

      {/* ===== AI SUMMARY DISPLAY ===== */}
      {selectedMail.summary && (
        <div className="mb-4 bg-gradient-to-br from-purple-600 to-indigo-600
        text-white p-5 rounded-xl shadow-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-100">
            <Sparkles size={18} />
            AI Summary
          </h4>
          <p className="text-sm leading-relaxed">{selectedMail.summary}</p>
        </div>
      )}

      {/* ===== AI DRAFT DISPLAY ===== */}
      {selectedMail.ai_draft && (
        <div className="mb-4 bg-gradient-to-br from-emerald-600 to-teal-600
        text-white p-5 rounded-xl shadow-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-emerald-100">
            <MessageSquare size={18} />
            AI Draft Reply
          </h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMail.ai_draft}</p>
          <button
            onClick={() => {
              setReply(selectedMail.ai_draft);
              setShowReplyBox(true);
            }}
            className="mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors"
          >
            Use this draft
          </button>
        </div>
      )}

      {/* ===== EMAIL BODY ===== */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="prose text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {selectedMail.body}
        </div>
      </div>

      {/* ===== LOCAL REPLY CARD ===== */}
      {reply && showReplyBox && (
        <div className="bg-white border-l-4 border-blue-500 p-5 rounded-xl shadow-md mb-4">
          <h4 className="font-medium mb-3 text-blue-600 flex items-center gap-2">
            <Send size={16} />
            Your Reply
          </h4>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={4}
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                openCompose();
                setShowReplyBox(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Send Reply
            </button>
            <button
              onClick={() => setShowReplyBox(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

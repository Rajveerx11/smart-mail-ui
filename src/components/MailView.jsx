import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const triggerAnalysis = useMailStore((s) => s.triggerAnalysis);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const openCompose = useMailStore((s) => s.openCompose);

  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  if (!selectedMail) {
    return (
      <div className="flex-1 p-8 text-gray-400 flex items-center justify-center">
        Select an email to read
      </div>
    );
  }

  /* ===== AI SUMMARY (from backend) ===== */
  const handleAnalyze = async () => {
    try {
      await triggerAnalysis(selectedMail.id);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  /* ===== AI SMART REPLY (local demo) ===== */
  const generateReply = () => {
    const replies = [
      "Thank you for the update. I will review this and get back to you shortly.",
      "Noted. Appreciate you sharing this information.",
      "Thanks for informing me. I will take the necessary action.",
      "Received with thanks. I will follow up if required.",
    ];
    setReply(replies[Math.floor(Math.random() * replies.length)]);
    setShowReplyBox(true);
  };

  return (
    <div className="flex-1 p-8 bg-[#f8fafc] overflow-y-auto">
      {/* SUBJECT */}
      <h2 className="text-2xl font-semibold mb-1">
        {selectedMail.subject}
      </h2>

      {/* FROM + CATEGORY BADGE */}
      <div className="flex items-center gap-2 mb-6">
        <p className="text-sm text-gray-600">
          From: {selectedMail.from}
        </p>
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

      {/* AI SUMMARY CARD (if exists) */}
      {selectedMail.summary && (
        <div className="mb-4 bg-gradient-to-br from-purple-600 to-indigo-600
        text-white p-4 rounded-xl shadow">
          <h4 className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles size={16} />
            AI Summary
          </h4>
          <p className="text-sm">{selectedMail.summary}</p>
        </div>
      )}

      {/* MAIL BODY */}
      <div className="bg-white rounded-xl shadow p-5 text-gray-800 mb-6">
        {selectedMail.body}
      </div>

      {/* AI ACTION BUTTONS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2 rounded-full
          bg-gradient-to-r from-purple-500 to-indigo-500
          text-white text-sm font-medium shadow hover:scale-105 transition
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {selectedMail.summary ? "Re-Analyze" : "AI Summarize"}
            </>
          )}
        </button>

        <button
          onClick={generateReply}
          className="flex items-center gap-2 px-5 py-2 rounded-full
          bg-gradient-to-r from-green-500 to-emerald-500
          text-white text-sm font-medium shadow hover:scale-105 transition"
        >
          <Send size={16} />
          Smart Reply
        </button>
      </div>

      {/* AI REPLY CARD */}
      {reply && showReplyBox && (
        <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow mb-4">
          <h4 className="font-medium mb-2 text-green-600">
            Suggested Reply
          </h4>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full border rounded p-2 text-sm text-gray-800 mb-2"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                openCompose();
                // Pre-fill compose with reply data
                setShowReplyBox(false);
              }}
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
            >
              Send Reply
            </button>
            <button
              onClick={() => setShowReplyBox(false)}
              className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

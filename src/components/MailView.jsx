<<<<<<< HEAD
import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
=======
import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
} from "lucide-react";
>>>>>>> 26db310 (Updated splash screen animation and UI fixes)
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const triggerAnalysis = useMailStore((s) => s.triggerAnalysis);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const openCompose = useMailStore((s) => s.openCompose);

  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  const summaryRef = useRef(null);
  const replyRef = useRef(null);

  /* CLOSE BOX ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (
        summaryRef.current &&
        !summaryRef.current.contains(e.target)
      ) {
        setSummary("");
      }

      if (
        replyRef.current &&
        !replyRef.current.contains(e.target)
      ) {
        setReply("");
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!selectedMail) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select an email to explore AI insights
      </div>
    );
  }

<<<<<<< HEAD
  /* ===== AI SUMMARY (from backend) ===== */
  const handleAnalyze = async () => {
    try {
      await triggerAnalysis(selectedMail.id);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  /* ===== AI SMART REPLY (local demo) ===== */
=======
  const generateSummary = () => {
    setSummary("Key points detected. Review action items quickly.");
  };

>>>>>>> 26db310 (Updated splash screen animation and UI fixes)
  const generateReply = () => {
    const replies = [
      "Thanks for the update.",
      "Noted, I’ll review.",
      "Received with thanks.",
      "Appreciate the information.",
    ];
    setReply(replies[Math.floor(Math.random() * replies.length)]);
    setShowReplyBox(true);
  };

  return (
    <div className="flex-1 p-10 bg-gradient-to-br from-slate-50 to-slate-100">

<<<<<<< HEAD
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
=======
      {/* CENTER CONTENT */}
      <div className="max-w-[520px]">
>>>>>>> 26db310 (Updated splash screen animation and UI fixes)

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-gray-900">
          {selectedMail.subject}
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          From: {selectedMail.from}
        </p>

<<<<<<< HEAD
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
=======
        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={generateSummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full
            bg-purple-100 text-purple-700 text-xs font-semibold
            hover:bg-purple-200 hover:shadow
            active:scale-95 transition-all"
          >
            <Sparkles size={14} />
            AI Summary
          </button>

          <button
            onClick={generateReply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full
            bg-emerald-100 text-emerald-700 text-xs font-semibold
            hover:bg-emerald-200 hover:shadow
            active:scale-95 transition-all"
          >
            <Send size={14} />
            Smart Reply
          </button>
>>>>>>> 26db310 (Updated splash screen animation and UI fixes)
        </div>

        {/* AI SUMMARY BOX */}
        {summary && (
          <div
            ref={summaryRef}
            className="mb-4 w-fit max-w-[360px]
            bg-white rounded-2xl shadow-lg
            px-5 py-4 text-sm text-gray-700
            animate-[fadeInScale_0.25s_ease-out]"
          >
            <div className="flex items-center gap-2 mb-1 text-purple-600 font-medium">
              <Sparkles size={14} />
              AI Summary
            </div>
            {summary}
          </div>
        )}

        {/* AI REPLY BOX */}
        {reply && (
          <div
            ref={replyRef}
            className="w-fit max-w-[360px]
            bg-white rounded-2xl shadow-lg
            px-5 py-4 text-sm text-gray-800
            animate-[fadeInScale_0.25s_ease-out]"
          >
            <div className="flex items-center gap-2 mb-1 text-emerald-600 font-medium">
              <Send size={14} />
              Suggested Reply
            </div>
            {reply}
          </div>
        )}

      </div>
    </div>
  );
}

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);

  const [summary, setSummary] = useState("");
  const [reply, setReply] = useState("");

  if (!selectedMail) {
    return (
      <div className="flex-1 p-8 text-gray-400 flex items-center justify-center">
        Select an email to read
      </div>
    );
  }

  /* ===== AI SUMMARY ===== */
  const generateSummary = () => {
    setSummary(
      "This email highlights key information regarding recent updates. It requires attention and possible follow-up action. Please review the content carefully and respond if needed."
    );
  };

  /* ===== AI SMART REPLY ===== */
  const generateReply = () => {
    const replies = [
      "Thank you for the update. I will review this and get back to you shortly.",
      "Noted. Appreciate you sharing this information.",
      "Thanks for informing me. I will take the necessary action.",
      "Received with thanks. I will follow up if required.",
    ];
    setReply(replies[Math.floor(Math.random() * replies.length)]);
  };

  return (
    <div className="flex-1 p-8 bg-[#f8fafc] overflow-y-auto">
      {/* SUBJECT */}
      <h2 className="text-2xl font-semibold mb-1">
        {selectedMail.subject}
      </h2>

      {/* FROM */}
      <p className="text-sm text-gray-600 mb-6">
        From: {selectedMail.from}
      </p>

      {/* MAIL BODY */}
      <div className="bg-white rounded-xl shadow p-5 text-gray-800 mb-6">
        {selectedMail.body}
      </div>

      {/* AI ACTION BUTTONS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={generateSummary}
          className="flex items-center gap-2 px-5 py-2 rounded-full
          bg-gradient-to-r from-purple-500 to-indigo-500
          text-white text-sm font-medium shadow hover:scale-105 transition"
        >
          <Sparkles size={16} />
          AI Summarize
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

      {/* AI SUMMARY CARD */}
      {summary && (
        <div className="mb-4 bg-gradient-to-br from-purple-600 to-indigo-600
        text-white p-4 rounded-xl shadow">
          <h4 className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles size={16} />
            AI Summary
          </h4>
          <p className="text-sm">{summary}</p>
        </div>
      )}

      {/* AI REPLY CARD */}
      {reply && (
        <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow">
          <h4 className="font-medium mb-1 text-green-600">
            Suggested Reply
          </h4>
          <p className="text-sm text-gray-800">{reply}</p>
        </div>
      )}
    </div>
  );
}

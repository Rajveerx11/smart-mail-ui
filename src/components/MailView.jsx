import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
} from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);

  const [summary, setSummary] = useState("");
  const [reply, setReply] = useState("");

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

  const generateSummary = () => {
    setSummary("Key points detected. Review action items quickly.");
  };

  const generateReply = () => {
    const replies = [
      "Thanks for the update.",
      "Noted, I’ll review.",
      "Received with thanks.",
      "Appreciate the information.",
    ];
    setReply(replies[Math.floor(Math.random() * replies.length)]);
  };

  return (
    <div className="flex-1 p-10 bg-gradient-to-br from-slate-50 to-slate-100">

      {/* CENTER CONTENT */}
      <div className="max-w-[520px]">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-gray-900">
          {selectedMail.subject}
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          From: {selectedMail.from}
        </p>

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

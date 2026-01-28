import { useState, useEffect } from "react";
import { Sparkles, Loader2, MessageSquare } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function MailView() {
  const selectedMail = useMailStore((s) => s.selectedMail);
  const isAnalyzing = useMailStore((s) => s.isAnalyzing);
  const generateAISummary = useMailStore((s) => s.generateAISummary);
  const generateAIDraft = useMailStore((s) => s.generateAIDraft);

  if (!selectedMail) return <div className="flex-1 flex items-center justify-center text-gray-400">Select an email</div>;

  const displayBody = selectedMail.body || "Loading message content...";

  return (
    <div className="flex-1 p-10 overflow-y-auto bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{selectedMail.subject}</h2>
        <p className="text-sm text-gray-600">From: {selectedMail.sender}</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={() => generateAISummary(selectedMail.id)} disabled={isAnalyzing} className="bg-indigo-600 text-white px-6 py-2 rounded-full flex gap-2 items-center">
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Summarize
        </button>
        <button onClick={() => generateAIDraft(selectedMail.id)} disabled={isAnalyzing} className="bg-emerald-600 text-white px-6 py-2 rounded-full flex gap-2 items-center">
          <MessageSquare size={16} /> AI Reply
        </button>
      </div>

      {selectedMail.summary && <div className="mb-4 p-4 bg-indigo-50 rounded-lg text-sm"><strong>Summary:</strong> {selectedMail.summary}</div>}
      {selectedMail.ai_draft && <div className="mb-4 p-4 bg-emerald-50 rounded-lg text-sm italic"><strong>Draft:</strong> {selectedMail.ai_draft}</div>}

      <div className="border rounded-xl p-6 whitespace-pre-wrap text-sm">{displayBody}</div>
    </div>
  );
}
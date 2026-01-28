import { useState, useEffect } from "react";
import { X, Minus, Loader2, SendHorizontal } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function ComposeModal() {
  const {
    isComposeOpen,
    isComposeMinimized,
    closeCompose,
    toggleMinimize,
    sendMail,
    selectedMail, // For handling replies
  } = useMailStore();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  // Auto-fill when replying to an AI draft
  useEffect(() => {
    if (isComposeOpen && selectedMail?.ai_draft) {
      setBody(selectedMail.ai_draft);
      setTo(selectedMail.sender || "");
      setSubject(`Re: ${selectedMail.subject}`);
    }
  }, [isComposeOpen, selectedMail]);

  if (!isComposeOpen) return null;

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert("Please fill in all fields before sending.");
      return;
    }

    setSending(true);
    try {
      // Hits the /send-email endpoint in your consolidated index.ts
      await sendMail({ to, subject, body });
      setTo("");
      setSubject("");
      setBody("");
      closeCompose();
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Error: Could not send email. Check your Resend API Key.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`fixed bottom-0 right-8 bg-white shadow-2xl rounded-t-2xl border border-gray-200 z-50 transition-all duration-300 ease-in-out
      ${isComposeMinimized ? "w-80 h-14" : "w-[550px] h-[500px]"}`}>

      {/* MODERN HEADER */}
      <div className="flex justify-between items-center px-6 py-3 bg-slate-900 text-white rounded-t-2xl">
        <span className="font-bold text-xs uppercase tracking-widest">New Message</span>
        <div className="flex gap-4">
          <button onClick={toggleMinimize} className="hover:text-indigo-400 transition-colors">
            <Minus size={20} />
          </button>
          <button onClick={closeCompose} className="hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {!isComposeMinimized && (
        <div className="flex flex-col h-[calc(100%-56px)]">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400 text-sm w-12 font-medium">To:</span>
              <input
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full outline-none text-sm font-medium text-gray-800"
              />
            </div>

            <div className="flex items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400 text-sm w-12 font-medium">Sub:</span>
              <input
                placeholder="What is this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full outline-none text-sm font-medium text-gray-800"
              />
            </div>

            <textarea
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full outline-none py-2 h-64 text-sm leading-relaxed text-gray-700 resize-none bg-slate-50/50 p-4 rounded-xl border border-dashed border-gray-200"
            />
          </div>

          {/* ACTION FOOTER */}
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest disabled:bg-gray-300 flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Sending...
                </>
              ) : (
                <>
                  <SendHorizontal size={14} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { X, Minus, Loader2 } from "lucide-react";
import { useMailStore } from "../store/mailStore";

export default function ComposeModal() {
  const {
    isComposeOpen,
    isComposeMinimized,
    closeCompose,
    toggleMinimize,
    sendMail,
  } = useMailStore();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  if (!isComposeOpen) return null;

  const handleSend = async () => {
    setSending(true);
    await sendMail({ to, subject, body });
    setSending(false);
    closeCompose();
  };

  return (
    <div className={`fixed bottom-4 right-4 bg-white shadow-2xl rounded-t-lg border border-gray-300 z-50
      ${isComposeMinimized ? "w-72 h-12" : "w-[500px]"}`}>

      {/* HEADER */}
      <div className="flex justify-between px-4 py-2 border-b bg-gray-800 text-white rounded-t-lg">
        <span className="font-medium text-sm">New Message</span>
        <div className="flex gap-3">
          <button onClick={toggleMinimize} className="hover:text-gray-300"><Minus size={18} /></button>
          <button onClick={closeCompose} className="hover:text-gray-300"><X size={18} /></button>
        </div>
      </div>

      {!isComposeMinimized && (
        <>
          <div className="p-4 space-y-3">
            <input
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border-b focus:border-blue-500 outline-none py-1 text-sm"
            />
            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-b focus:border-blue-500 outline-none py-1 text-sm"
            />
            <textarea
              placeholder="Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border focus:border-blue-500 outline-none p-2 h-48 text-sm resize-none"
            />
          </div>

          <div className="p-4 flex justify-between items-center bg-gray-50">
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm disabled:bg-blue-400 flex items-center gap-2"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
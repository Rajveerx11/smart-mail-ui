import { useState } from "react";
import { X, Minus } from "lucide-react";
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

  if (!isComposeOpen) return null;

  const handleSend = () => {
    sendMail({
      from: "me@gmail.com",
      to,
      subject,
      body,
    });
    closeCompose();
  };

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white shadow-xl rounded-lg
      ${isComposeMinimized ? "w-72 h-12" : "w-[420px]"}`}
    >
      {/* HEADER */}
      <div className="flex justify-between px-3 py-2 border-b bg-gray-100">
        <span className="font-medium text-sm">New Message</span>
        <div className="flex gap-2">
          <button onClick={toggleMinimize}>
            <Minus size={16} />
          </button>
          <button onClick={closeCompose}>
            <X size={16} />
          </button>
        </div>
      </div>

      {!isComposeMinimized && (
        <>
          <div className="p-3 space-y-2">
            <input
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border px-2 py-1"
            />
            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border px-2 py-1"
            />
            <textarea
              placeholder="Message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border px-2 py-1 h-32"
            />
          </div>

          <div className="p-3 flex justify-end">
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-1 rounded"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

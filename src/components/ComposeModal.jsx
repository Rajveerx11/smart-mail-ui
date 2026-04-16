import { useEffect, useRef, useState } from "react";
import { Loader2, Minus, Paperclip, SendHorizontal, X } from "lucide-react";
import { useMailStore, supabase } from "../store/mailStore";

export default function ComposeModal() {
  const {
    isComposeOpen,
    isComposeMinimized,
    closeCompose,
    toggleMinimize,
    sendMail,
    selectedMail,
  } = useMailStore();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isComposeOpen && selectedMail?.ai_draft) {
      setBody(selectedMail.ai_draft);
      setTo(selectedMail.sender || "");
      setSubject(`Re: ${selectedMail.subject}`);
    }
  }, [isComposeOpen, selectedMail]);

  useEffect(() => {
    if (!isComposeOpen) {
      setAttachments([]);
      setUploadError(null);
    }
  }, [isComposeOpen]);

  if (!isComposeOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (files) => {
    const uuid = crypto.randomUUID();
    const uploadedMeta = [];

    for (const file of files) {
      const storagePath = `outbound/${uuid}/${file.name}`;
      const { error } = await supabase.storage
        .from("email-attachments")
        .upload(storagePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        console.error("Upload failed for:", file.name, error);
        throw new Error(`Failed to upload ${file.name}`);
      }

      uploadedMeta.push({
        filename: file.name,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        storage_path: storagePath,
      });
    }

    return uploadedMeta;
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert("Please fill in all fields before sending.");
      return;
    }

    setSending(true);
    setUploadError(null);

    try {
      let attachmentsMeta = null;

      if (attachments.length > 0) {
        try {
          attachmentsMeta = await uploadAttachments(attachments);
        } catch (uploadErr) {
          setUploadError(uploadErr.message);
          console.error("Attachment upload failed:", uploadErr);
        }
      }

      await sendMail({ to, subject, body, attachments: attachmentsMeta });
      alert("Message was successfully sent");
      setTo("");
      setSubject("");
      setBody("");
      setAttachments([]);
      closeCompose();
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Error: Could not send email. Check your Resend API Key.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`fixed bottom-0 right-8 bg-white shadow-2xl rounded-t-lg border border-slate-200 z-50 transition-all duration-300 ease-in-out
      ${isComposeMinimized ? "w-80 h-14" : "w-[550px] h-[520px]"}`}>
      <div className="flex justify-between items-center px-5 py-3 bg-slate-950 text-white rounded-t-lg">
        <span className="font-semibold text-sm">New message</span>
        <div className="flex gap-1">
          <button onClick={toggleMinimize} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Minimize compose">
            <Minus size={18} />
          </button>
          <button onClick={closeCompose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close compose">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isComposeMinimized && (
        <div className="flex flex-col h-[calc(100%-56px)]">
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center border-b border-slate-100 pb-2">
              <span className="text-slate-400 text-sm w-14 font-medium">To</span>
              <input
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full outline-none text-sm font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center border-b border-slate-100 pb-2">
              <span className="text-slate-400 text-sm w-14 font-medium">Subject</span>
              <input
                placeholder="What is this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full outline-none text-sm font-medium text-slate-800"
              />
            </div>

            <textarea
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full outline-none h-52 text-sm leading-relaxed text-slate-700 resize-none bg-slate-50 p-4 rounded-lg border border-slate-200 focus:border-blue-200 transition-colors"
            />

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="rounded-lg hover:text-red-500 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-500">{uploadError} - Email sent without attachment.</p>
            )}
          </div>

          <div className="px-5 py-4 flex justify-between items-center bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm disabled:bg-slate-300 flex items-center gap-2 transition-all shadow-sm"
              >
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Sending
                  </>
                ) : (
                  <>
                    <SendHorizontal size={14} />
                    Send message
                  </>
                )}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-blue-600"
                title="Attach files"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {attachments.length > 0 && (
              <span className="text-xs text-slate-400">{attachments.length} file(s) attached</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

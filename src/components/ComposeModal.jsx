import { useState, useEffect, useRef } from "react";
import { X, Minus, Loader2, SendHorizontal, Paperclip } from "lucide-react";
import { useMailStore, supabase } from "../store/mailStore";

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
  const [attachments, setAttachments] = useState([]); // File objects
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

  // Auto-fill when replying to an AI draft
  useEffect(() => {
    if (isComposeOpen && selectedMail?.ai_draft) {
      setBody(selectedMail.ai_draft);
      setTo(selectedMail.sender || "");
      setSubject(`Re: ${selectedMail.subject}`);
    }
  }, [isComposeOpen, selectedMail]);

  // Reset attachments when modal closes
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
    e.target.value = ""; // Reset input
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload attachments to Supabase Storage and return metadata
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

      // Upload attachments if any
      if (attachments.length > 0) {
        try {
          attachmentsMeta = await uploadAttachments(attachments);
        } catch (uploadErr) {
          setUploadError(uploadErr.message);
          // Continue sending without attachments
          console.error("Attachment upload failed:", uploadErr);
        }
      }

      // Hits the /send-email endpoint in your consolidated index.ts
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
    <div className={`fixed bottom-0 right-8 bg-white shadow-2xl rounded-t-2xl border border-gray-200 z-50 transition-all duration-300 ease-in-out
      ${isComposeMinimized ? "w-80 h-14" : "w-[550px] h-[520px]"}`}>

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
              className="w-full outline-none py-2 h-48 text-sm leading-relaxed text-gray-700 resize-none bg-slate-50/50 p-4 rounded-xl border border-dashed border-gray-200"
            />

            {/* ATTACHMENTS LIST */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-500">{uploadError} — Email sent without attachment.</p>
            )}
          </div>

          {/* ACTION FOOTER */}
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-3">
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

              {/* ATTACHMENT BUTTON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-indigo-600"
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
              <span className="text-xs text-gray-400">{attachments.length} file(s) attached</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

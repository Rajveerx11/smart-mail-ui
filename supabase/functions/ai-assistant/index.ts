// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const payload = await req.json();
    const apiKey = Deno.env.get("RESEND_API_KEY");

    // --- ROUTE A: SEND EMAIL (From UI) ---
    if (url.pathname.endsWith('/send-email')) {
      const { to, subject, body, attachments } = payload;

      // Process attachments: generate signed URLs from Supabase Storage
      let resendAttachments: { path: string; filename: string }[] = [];
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        for (const att of attachments) {
          if (!att.storage_path || !att.filename) {
            console.warn("Skipping invalid attachment:", att);
            continue;
          }
          const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 7; // 7 days
          const { data: signedData, error: signedError } = await supabase.storage
            .from("email-attachments")
            .createSignedUrl(att.storage_path, SIGNED_URL_EXPIRY);
          if (signedError || !signedData?.signedUrl) {
            console.error("Failed to create signed URL for:", att.storage_path, signedError);
            continue;
          }
          resendAttachments.push({ path: signedData.signedUrl, filename: att.filename });
        }
      }

      const resendPayload: any = { from: "rajveer.vadnal@bodhakai.online", to: [to], subject, text: body };
      if (resendAttachments.length > 0) {
        resendPayload.attachments = resendAttachments;
      }

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(resendPayload),
      });
      const data = await resendRes.json();
      if (!resendRes.ok) throw new Error(data.message || "Failed to send");

      // Save to Sent folder (include attachments metadata if present)
      await supabase.from("emails").insert([{
        message_id: data.id,
        sender: "rajveer.vadnal@bodhakai.online",
        recipient: to,
        subject,
        body,
        folder: "Sent",
        read_status: true,
        attachments: attachments || null
      }]);

      return new Response(JSON.stringify({ success: true, id: data.id }), { headers: corsHeaders });
    }

    // --- ROUTE B: AI COPILOT (Summarize / Reply) ---
    const isAiRequest = url.pathname.endsWith('/summarize') || url.pathname.endsWith('/generate-reply');
    if (isAiRequest) {
      const { email_id } = payload;
      const { data: email } = await supabase.from("emails").select("body, subject").eq("id", email_id).single();
      
      const prompt = url.pathname.endsWith('/summarize') 
        ? `Summarize this email in 3 bullet points. Provide ONLY the bullets. No intro text. Subject: ${email.subject}. Body: ${email.body}`
        : `Draft a professional reply to this email. Provide ONLY the draft content. No intro text. Subject: ${email.subject}. Body: ${email.body}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] }),
      });

      const gData = await groqRes.json();
      const aiContent = gData.choices[0].message.content;
      const updateField = url.pathname.endsWith('/summarize') ? { summary: aiContent } : { ai_draft: aiContent };
      await supabase.from("emails").update(updateField).eq("id", email_id);

      return new Response(JSON.stringify({ success: true, data: aiContent }), { headers: corsHeaders });
    }

    // --- ROUTE C: INBOUND WEBHOOK (Retrieve Full Content) ---
    if (payload.type === 'email.received') {
      const emailId = payload.data.email_id;

      /**
       * RESEND RETRIEVAL FIX:
       * 1. Path must be /emails/receiving/ to fetch inbound mail.
       * 2. NO Content-Type header on a GET request.
       * 3. Accept: application/json tells Resend what format to return.
       */
      const retrieveRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json" 
        }
      });
      
      const fullEmail = await retrieveRes.json();
      
      if (!retrieveRes.ok) {
        console.error("RESEND ERROR:", fullEmail);
        throw new Error(`Resend Error: ${fullEmail.message}`);
      }
      
      const bodyContent = fullEmail.text || fullEmail.html || "No content found";

      const extractEmail = (str: any) =>
        typeof str === "string" ? str.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str : str;

      // --- INBOUND ATTACHMENTS HANDLING ---
      // Uses Resend Attachments API: GET /emails/receiving/attachments?emailId=<id>
      const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB limit
      let inboundAttachments: { filename: string; mime_type: string; size: number; storage_path: string }[] | null = null;

      try {
        // Fetch all attachment metadata from Resend Attachments API
        const attachmentsRes = await fetch(
          `https://api.resend.com/emails/receiving/attachments?email_id=${emailId}`,
          {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` }
          }
        );

        if (attachmentsRes.ok) {
          const attachmentsList = await attachmentsRes.json();
          
          // Resend returns { data: [...] } or an array directly
          const attachments = Array.isArray(attachmentsList) 
            ? attachmentsList 
            : (attachmentsList.data || []);

          if (attachments.length > 0) {
            inboundAttachments = [];

            for (const att of attachments) {
              try {
                if (!att.download_url || !att.filename) {
                  console.warn("Skipping attachment with missing download_url/filename:", att.id);
                  continue;
                }

                // Download the attachment binary immediately (URL expires after ~1 hour)
                const downloadRes = await fetch(att.download_url);
                if (!downloadRes.ok) {
                  console.warn("Failed to download attachment:", att.filename);
                  continue;
                }

                const fileBuffer = await downloadRes.arrayBuffer();
                const fileSize = fileBuffer.byteLength;

                // Skip if exceeds size limit
                if (fileSize > MAX_ATTACHMENT_SIZE) {
                  console.warn("Skipping attachment exceeding 10MB limit:", att.filename, fileSize);
                  continue;
                }

                // Upload to Supabase Storage
                const storagePath = `inbound/${emailId}/${att.filename}`;
                const { error: uploadError } = await supabase.storage
                  .from("email-attachments")
                  .upload(storagePath, fileBuffer, {
                    contentType: att.content_type || "application/octet-stream",
                    upsert: false
                  });

                if (uploadError) {
                  console.warn("Failed to upload attachment to storage:", att.filename, uploadError.message);
                  continue;
                }

                inboundAttachments.push({
                  filename: att.filename,
                  mime_type: att.content_type || "application/octet-stream",
                  size: fileSize,
                  storage_path: storagePath
                });
              } catch (attErr: any) {
                console.warn("Error processing attachment:", att.filename, attErr.message);
                continue;
              }
            }

            // Set to null if no attachments were successfully processed
            if (inboundAttachments.length === 0) {
              inboundAttachments = null;
            }
          }
        } else {
          // Non-fatal: log warning and continue without attachments
          console.warn("Failed to fetch attachments list from Resend:", attachmentsRes.status);
        }
      } catch (attachmentErr: any) {
        // Non-fatal: attachment handling should never block email insertion
        console.warn("Attachment handling failed:", attachmentErr.message);
      }

      const { error } = await supabase.from("emails").insert([{
        message_id: emailId,
        sender: extractEmail(fullEmail.from),
        recipient: extractEmail(Array.isArray(fullEmail.to) ? fullEmail.to[0] : fullEmail.to),
        subject: fullEmail.subject || "(No Subject)",
        body: bodyContent,
        raw_json: fullEmail,
        folder: "Inbox",
        attachments: inboundAttachments
      }]);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Route not found" }), { status: 404, headers: corsHeaders });

  } catch (err: any) {
    console.error("CRITICAL ERROR:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
});
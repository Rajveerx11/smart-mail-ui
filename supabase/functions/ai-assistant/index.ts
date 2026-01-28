// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight (Fixes browser blocked requests)
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

    // --- ROUTE A: SEND EMAIL (From Compose Modal) ---
    if (url.pathname.endsWith('/send-email')) {
      const { to, subject, body } = payload;
      
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "rajveer.vadnal@bodhakai.online", // Ensure this domain is verified in Resend
          to: to,
          subject: subject,
          text: body,
        }),
      });

      const resendData = await resendResponse.json();
      if (!resendResponse.ok) throw new Error(resendData.message || "Failed to send via Resend");

      return new Response(JSON.stringify({ success: true, id: resendData.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- ROUTE B: AI COPILOT (Summarize / Generate Draft) ---
    const isAiRequest = url.pathname.endsWith('/summarize') || url.pathname.endsWith('/generate-reply');
    if (isAiRequest) {
      const { email_id } = payload;
      const isSummarize = url.pathname.endsWith('/summarize');

      const { data: email, error: fetchError } = await supabase
        .from("emails")
        .select("body, subject")
        .eq("id", email_id)
        .single();

      if (fetchError || !email) throw new Error("Email body not found in database for AI processing");

      const prompt = isSummarize 
        ? `Summarize this email in 3 bullet points. Subject: ${email.subject}. Body: ${email.body}`
        : `Draft a professional, concise reply to this email. Subject: ${email.subject}. Body: ${email.body}`;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const groqData = await groqResponse.json();
      const aiContent = groqData.choices[0].message.content;

      const updateField = isSummarize ? { summary: aiContent } : { ai_draft: aiContent };
      await supabase.from("emails").update(updateField).eq("id", email_id);

      return new Response(JSON.stringify({ success: true, data: aiContent }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- ROUTE C: INBOUND WEBHOOK (From Resend) ---
    else {
      const email = payload.data || {};
      
      /**
       * ROBUST CONTENT CAPTURE
       * We check every possible key Resend might use for the body content.
       * If all content fields are missing, we store the metadata as a fallback.
       */
      const capturedBody = 
        email.text || 
        email.html || 
        email.body || 
        `DEBUG: Body missing in payload. Metadata: ${JSON.stringify(email).substring(0, 200)}`;

      const extractEmail = (str: any) =>
        typeof str === "string" 
          ? str.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str 
          : str;

      const { error } = await supabase.from("emails").insert([
        {
          message_id: email.id || email.message_id || `rec-${Date.now()}`,
          sender: extractEmail(email.from) || "unknown@sender.com",
          recipient: (Array.isArray(email.to) ? email.to[0] : email.to) || "unknown@recipient.com",
          subject: email.subject || "(No Subject)",
          body: capturedBody, // Mapping fixed to ensure UI sees content
          raw_json: payload,  // Save full audit trail for debugging
          folder: "Inbox",
          processed: false,
        },
      ]);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err: any) {
    console.error("CRITICAL ERROR:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
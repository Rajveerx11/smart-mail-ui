// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const payload = await req.json();

    // --- ROUTE A: SEND EMAIL ---
    if (url.pathname.endsWith('/send-email')) {
      const { to, subject, body } = payload;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "rajveer.vadnal@bodhakai.online", to, subject, text: body }),
      });
      return new Response(JSON.stringify(await res.json()), { headers: corsHeaders });
    }

    // --- ROUTE B: AI COPILOT ---
    const isAiRequest = url.pathname.endsWith('/summarize') || url.pathname.endsWith('/generate-reply');
    if (isAiRequest) {
      const { email_id } = payload;
      const { data: email } = await supabase.from("emails").select("*").eq("id", email_id).single();
      
      const prompt = url.pathname.endsWith('/summarize') 
        ? `Summarize this email in 3 bullets: ${email.body}`
        : `Draft a professional reply to: ${email.body}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] }),
      });

      const gData = await groqRes.json();
      const content = gData.choices[0].message.content;
      await supabase.from("emails").update(url.pathname.endsWith('/summarize') ? { summary: content } : { ai_draft: content }).eq("id", email_id);
      return new Response(JSON.stringify({ success: true, data: content }), { headers: corsHeaders });
    }

    // --- ROUTE C: INBOUND WEBHOOK (THE FIX) ---
    else {
      const webhookData = payload.data || {};
      const emailId = webhookData.email_id;

      if (!emailId) throw new Error("No email_id found in webhook");

      /**
       * RESEND DOCS FIX: Call the Retrieve Received Email API
       * Webhooks only send metadata. We must fetch the body separately
       */
      const retrieveRes = await fetch(`https://api.resend.com/emails/received/${emailId}`, {
        headers: { "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}` }
      });
      
      const fullEmail = await retrieveRes.json();
      
      const bodyContent = fullEmail.text || fullEmail.html || "No content retrieved from API";

      const extractEmail = (str: any) =>
        typeof str === "string" ? str.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str : str;

      const { error } = await supabase.from("emails").insert([{
        message_id: emailId,
        sender: extractEmail(fullEmail.from),
        recipient: extractEmail(fullEmail.to),
        subject: fullEmail.subject || "(No Subject)",
        body: bodyContent,
        raw_json: fullEmail, // Store the full API response for safety
        folder: "Inbox"
      }]);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
});
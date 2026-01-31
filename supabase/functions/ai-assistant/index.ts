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
      const { to, subject, body } = payload;
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "rajveer.vadnal@bodhakai.online", to: [to], subject, text: body }),
      });
      const data = await resendRes.json();
      if (!resendRes.ok) throw new Error(data.message || "Failed to send");
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

      const { error } = await supabase.from("emails").insert([{
        message_id: emailId,
        sender: extractEmail(fullEmail.from),
        recipient: extractEmail(Array.isArray(fullEmail.to) ? fullEmail.to[0] : fullEmail.to),
        subject: fullEmail.subject || "(No Subject)",
        body: bodyContent,
        raw_json: fullEmail,
        folder: "Inbox"
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
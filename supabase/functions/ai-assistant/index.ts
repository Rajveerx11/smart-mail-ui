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
    const isAiRequest = url.pathname.endsWith('/summarize') || url.pathname.endsWith('/generate-reply');

    if (isAiRequest) {
      /**
       * CASE A: MANUAL AI COPILOT REQUEST
       */
      const { email_id } = payload;
      const isSummarize = url.pathname.endsWith('/summarize');

      const { data: emailData, error: fetchError } = await supabase
        .from("emails")
        .select("body")
        .eq("id", email_id)
        .single();

      if (fetchError || !emailData) throw new Error("Email content not found");

      const groqApiKey = Deno.env.get("GROQ_API_KEY");
      const prompt = isSummarize 
        ? `Summarize this email concisely in 3 bullet points: ${emailData.body}`
        : `Draft a professional and concise reply to this email: ${emailData.body}`;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const groqData = await groqResponse.json();
      const aiContent = groqData.choices[0].message.content;

      const updateData = isSummarize ? { summary: aiContent } : { ai_draft: aiContent };
      const { error: updateError } = await supabase
        .from("emails")
        .update(updateData)
        .eq("id", email_id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true, data: aiContent }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      /**
       * CASE B: INBOUND WEBHOOK (Resend)
       * FIXED: Robust body extraction to solve "No Content" issue
       */
      const email = payload.data;
      if (!email) throw new Error("No data found in webhook payload");

      // Extract body from any available field Resend might use
      const capturedBody = email.text || email.body || email.html || "No content found in payload";

      const extractEmail = (str: any) =>
        typeof str === "string"
          ? str.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str
          : str;

      const recipientRaw = Array.isArray(email.to) ? email.to[0] : email.to;

      const { error } = await supabase.from("emails").insert([
        {
          message_id: email.id || email.message_id || `rec-${Date.now()}`,
          sender: extractEmail(email.from),
          recipient: extractEmail(recipientRaw),
          subject: email.subject || "No Subject",
          body: capturedBody, // Now mapped correctly
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
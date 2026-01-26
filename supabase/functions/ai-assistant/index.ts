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
      const { email_id } = payload;
      const isSummarize = url.pathname.endsWith('/summarize');

      // 1. Fetch Email
      const { data: emailData, error: fetchError } = await supabase
        .from("emails")
        .select("body, subject")
        .eq("id", email_id)
        .single();

      if (fetchError || !emailData) throw new Error(`Email not found: ${fetchError?.message}`);

      // 2. Groq Logic
      const groqApiKey = Deno.env.get("GROQ_API_KEY");
      if (!groqApiKey) throw new Error("GROQ_API_KEY is not set in Supabase Secrets");

      const prompt = isSummarize 
        ? `Summarize this email in 3 bullet points. Subject: ${emailData.subject}. Body: ${emailData.body}`
        : `Draft a professional reply to this email. Subject: ${emailData.subject}. Body: ${emailData.body}`;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Using a highly stable model ID
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!groqResponse.ok) {
        const errorData = await groqResponse.json();
        throw new Error(`Groq API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const groqData = await groqResponse.json();
      const aiContent = groqData.choices[0].message.content;

      // 3. Update DB
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
      // (Your existing Case B logic for Inbound Webhooks stays here...)
      // ... Keep your robust body extraction logic we fixed earlier ...
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("CRITICAL ERROR:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, // This is what triggers your browser's 400 error
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
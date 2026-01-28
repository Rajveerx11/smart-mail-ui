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
    
    // Check if this is AI request or Webhook
    const isAiRequest = url.pathname.endsWith('/summarize') || url.pathname.endsWith('/generate-reply');

    if (isAiRequest) {
      const { email_id } = payload;
      const { data: email } = await supabase.from("emails").select("*").eq("id", email_id).single();
      
      const prompt = url.pathname.endsWith('/summarize') 
        ? `Summarize in 3 bullets: ${email.body}`
        : `Draft a professional reply to: ${email.body}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const gData = await res.json();
      const aiContent = gData.choices[0].message.content;
      const updateKey = url.pathname.endsWith('/summarize') ? "summary" : "ai_draft";
      
      await supabase.from("emails").update({ [updateKey]: aiContent }).eq("id", email_id);
      return new Response(JSON.stringify({ success: true, data: aiContent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else {
      /* CASE B: WEBHOOK (Improved Logic) */
      const data = payload.data || {};
      
      // DEEP SEARCH for body content
      const bodyContent = data.text || data.html || payload.text || payload.html || data.body || "Body content missing from webhook payload";

      const extractEmail = (str: any) =>
        typeof str === "string" ? str.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str : str;

      const { error } = await supabase.from("emails").insert([
        {
          message_id: data.message_id || data.email_id || `rec-${Date.now()}`,
          sender: extractEmail(data.from) || "unknown@sender.com",
          recipient: (Array.isArray(data.to) ? data.to[0] : data.to) || "unknown@recipient.com",
          subject: data.subject || "No Subject",
          body: bodyContent,
          raw_json: payload, // Store the WHOLE thing for debugging
          folder: "Inbox",
          processed: false,
        },
      ]);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
});
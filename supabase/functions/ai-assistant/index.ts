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

    // --- ROUTE: INBOUND WEBHOOK (RESEND) ---
    if (payload.type === 'email.received') {
      const emailId = payload.data.email_id;
      const apiKey = Deno.env.get("RESEND_API_KEY");

      // 1. Fetch full email from Resend
      const retrieveRes = await fetch(`https://api.resend.com/emails/received/${emailId}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
      
      const fullEmail = await retrieveRes.json();
      
      // 2. Error Check: If API key is invalid, don't save a broken row!
      if (!retrieveRes.ok) {
        console.error("RESEND API ERROR:", fullEmail);
        throw new Error(`Resend API Error: ${fullEmail.message}`);
      }
      
      // 3. Extract content
      const bodyContent = fullEmail.text || fullEmail.html || "No body content found";

      const extractEmail = (str: any) =>
        typeof str === "string" ? str.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str : str;

      // 4. Insert into DB
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

    // ... [Keep your /send-email and AI logic here]
    
  } catch (err: any) {
    console.error("LOGIC CRASH:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
});
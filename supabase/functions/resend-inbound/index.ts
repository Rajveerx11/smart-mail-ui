import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log("Full Payload:", JSON.stringify(payload)) // Helps you debug in Supabase Logs

    const email = payload.data
    if (!email) throw new Error("No data found in webhook payload")

    // Helper to extract email if it comes as "Name <email@gmail.com>"
    const extractEmail = (str: any) => str?.match(/<(.+)>|(\S+@\S+\.\S+)/)?.[0]?.replace(/[<>]/g, "") || str;

    const { error } = await supabase.from('emails').insert([{
      message_id: email.id || email.message_id || `rec-${Date.now()}`,
      sender: extractEmail(email.from),
      recipient: extractEmail(Array.isArray(email.to) ? email.to[0] : email.to),
      subject: email.subject || 'No Subject',
      body: email.text || email.html || '',
      folder: 'Inbox',
      processed: false 
    }])

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err: any) {
    console.error("Webhook Logic Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})
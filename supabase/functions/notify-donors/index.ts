import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { record } = await req.json(); // Assuming Trigger payload structure. If direct call, adjust.
    // For this implementation, we assume it's capable of handling both or primarily Trigger if setup as such.
    // However, the requirement says "Trigger backend logic". 
    // If it's a direct call from frontend, the payload might be { receiver_name, ... } or just { request_id }.
    // Let's assume it is called explicitly with the `request` data after insertion.

    // If called via webhook (database trigger), `record` is the new row.
    // If called via client, we might expect `request_id` and query it.
    // Let's go with the explicit `request` object passed in the body for simplicity and control.

    const requestData = record || (await req.json()).request;

    if (!requestData) {
      throw new Error("No request data provided");
    }

    const { id, blood_group_required, location, receiver_name } = requestData;

    // 1. Find matching donors
    const { data: donors, error: donorError } = await supabaseClient
      .from("donors")
      .select("*")
      .eq("blood_group", blood_group_required)
      .eq("is_active", true);

    if (donorError) throw donorError;

    // 2. Send Notifications via Twilio WhatsApp
    const results = [];
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g., whatsapp:+14155238886

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
      console.warn("Twilio credentials not configured. Skipping WhatsApp notifications.");
      // Still log to notifications table for testing
      for (const donor of donors || []) {
        console.log(`Would send WhatsApp to ${donor.phone_number} for request ${id}`);
        results.push({ donor_id: donor.id, status: 'skipped', request_id: id });
      }
    } else {
      // Send real WhatsApp messages via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      for (const donor of donors || []) {
        try {
          const message = `🚨 Blood Request Alert\nBlood Group: ${blood_group_required}\nLocation: ${location}\nPatient: ${receiver_name}\nRequest Link: ${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '')}/request/${id}`;

          const formData = new URLSearchParams({
            From: TWILIO_WHATSAPP_FROM,
            To: `whatsapp:${donor.phone_number}`,
            Body: message
          });

          const res = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
          });

          const responseData = await res.json();

          if (res.ok) {
            console.log(`WhatsApp sent to ${donor.phone_number}:`, responseData.sid);
            results.push({ donor_id: donor.id, status: 'sent', request_id: id });
          } else {
            console.error(`Failed to send to ${donor.phone_number}:`, responseData);
            results.push({ donor_id: donor.id, status: 'failed', request_id: id });
          }
        } catch (err) {
          console.error(`Error sending to ${donor.phone_number}:`, err);
          results.push({ donor_id: donor.id, status: 'error', request_id: id });
        }
      }
    }

    // 3. Log to notifications table
    if (results.length > 0) {
      const { error: notifyError } = await supabaseClient
        .from("notifications")
        .insert(results.map(r => ({
          request_id: r.request_id,
          donor_id: r.donor_id,
          delivery_status: r.status
        })));

      if (notifyError) console.error("Error logging notifications:", notifyError);
    }

    return new Response(JSON.stringify({ success: true, matched_donors: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

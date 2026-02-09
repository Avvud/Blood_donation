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

        const { request_id } = await req.json();

        if (!request_id) {
            throw new Error("Missing request_id");
        }

        // 1. Mark request as closed
        const { data: request, error: updateError } = await supabaseClient
            .from("requests")
            .update({ status: "closed", closed_at: new Date() })
            .eq("id", request_id)
            .select()
            .single();

        if (updateError) throw updateError;
        if (!request) throw new Error("Request not found");

        // 2. Find donors who were notified about this request
        const { data: notifications, error: notifyFetchError } = await supabaseClient
            .from("notifications")
            .select("donor_id, donors(phone_number, name)")
            .eq("request_id", request_id);

        if (notifyFetchError) throw notifyFetchError;

        // 3. Send "Thank You/Closed" Notification
        // Similar to notify-donors, this mocks the API call
        console.log(`Sending Close Notifications to ${notifications.length} donors.`);

        for (const notification of notifications) {
            // notification.donors is an array or object depending on join, usually object if 1:1, but here it's M:1 query so it returns object.
            // Actually Supabase returns nested object for relations.
            const donor = notification.donors;
            if (donor && donor.phone_number) {
                console.log(`Notifying ${donor.phone_number}: Request ${request_id} is fulfilled. Thanks!`);
                // Mock API call to WhatsApp
            }
        }

        return new Response(JSON.stringify({ success: true, message: "Request closed and donors notified" }), {
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }

    const customerId = customers.data[0].id;
    
    // Get origin for return URL
    const origin = req.headers.get("origin") || "https://your-app-domain.com";
    
    // Check if specific action was requested
    const { action } = await req.json().catch(() => ({ action: null }));
    
    let portalSession;
    
    if (action === "downgrade") {
      // If downgrade action, focus on the subscription management page
      portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/subscription`,
        flow_data: {
          type: "subscription_cancel",
          subscription_cancel: {
            subscription: "auto", // Will automatically select the customer's subscription
          },
        },
      });
    } else {
      // Standard portal session
      portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/subscription`,
      });
    }

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});


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
      // Create a subscribers record for a non-subscribed user
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let currentPeriodStart = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      
      // Get price details to determine tier
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      
      // Use nickname or metadata to determine tier
      subscriptionTier = price.nickname || 
                         subscription.metadata.tier_name ||
                         'Unknown';
    }

    // Update subscribers table with latest info
    await supabaseClient.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customers.data[0].id,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      current_period_start: currentPeriodStart,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      current_period_start: currentPeriodStart
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

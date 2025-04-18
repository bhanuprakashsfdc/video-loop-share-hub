
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAUSE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use the service role key to perform writes in Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body to get pause duration
    const { pauseDuration = 30 } = await req.json();
    logStep("Request parsed", { pauseDuration });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found for this user");
    }
    
    const subscription = subscriptions.data[0];
    logStep("Found active subscription", { subscriptionId: subscription.id });
    
    // Calculate pause end date (current time + pauseDuration days)
    const pauseUntil = Math.floor(Date.now() / 1000) + (pauseDuration * 24 * 60 * 60);
    
    // Pause the subscription by setting pause_collection
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      pause_collection: {
        behavior: 'mark_uncollectible', // or 'keep_as_draft' based on your needs
        resumes_at: pauseUntil
      }
    });
    
    logStep("Subscription paused", { 
      subscriptionId: updatedSubscription.id, 
      pauseUntil: new Date(pauseUntil * 1000).toISOString() 
    });

    // Update the subscriber record in Supabase
    await supabaseClient.from("subscribers").update({
      subscription_paused: true,
      pause_until: new Date(pauseUntil * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("email", user.email);
    
    logStep("Updated subscriber record in database");

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription paused successfully",
      resumeDate: new Date(pauseUntil * 1000).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

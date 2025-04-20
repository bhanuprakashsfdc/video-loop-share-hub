
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map price identifiers to actual Stripe price IDs
const PRICE_MAPPING = {
  "price_individual": "price_1PWvgHCaQ9UR8KhT8p95MdlD", // Replace with actual Stripe price ID
  "price_business": "price_1PWvgcCaQ9UR8KhTrT3I1POv", // Replace with actual Stripe price ID
  "price_enterprise": "price_1PWvh0CaQ9UR8KhTf8CZGdyb", // Replace with actual Stripe price ID 
  "price_lifetime": "price_1PWvhHCaQ9UR8KhT9NLSdEkW" // Replace with actual Stripe price ID
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting create-checkout function");
    const { priceId } = await req.json();
    console.log("Received price ID:", priceId);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    console.log("Authenticated user:", user.email);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    console.log("Checking for existing Stripe customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    }

    // Determine price tier name for metadata
    let tierName;
    if (priceId === "price_individual") {
      tierName = "Individual";
    } else if (priceId === "price_business") {
      tierName = "Business";
    } else if (priceId === "price_enterprise") {
      tierName = "Enterprise";
    } else if (priceId === "price_lifetime") {
      tierName = "Lifetime";
    } else {
      tierName = "Unknown";
    }
    console.log("Tier identified:", tierName);

    // Get the actual Stripe price ID from our mapping
    const stripePriceId = PRICE_MAPPING[priceId];
    if (!stripePriceId) throw new Error(`Invalid price ID: ${priceId}`);
    console.log("Using Stripe price ID:", stripePriceId);

    console.log("Creating checkout session");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ 
        price: stripePriceId,
        quantity: 1 
      }],
      mode: tierName === "Lifetime" ? "payment" : "subscription",
      success_url: `${req.headers.get("origin")}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        tier_name: tierName
      },
      subscription_data: tierName !== "Lifetime" ? {
        metadata: {
          user_id: user.id,
          tier_name: tierName
        }
      } : undefined
    });

    console.log("Checkout session created successfully:", session.id);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

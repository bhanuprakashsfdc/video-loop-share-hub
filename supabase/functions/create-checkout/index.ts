
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

    // Validate that we have a Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if user already has a Stripe customer account
    console.log("Checking for existing Stripe customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found, will create new one during checkout");
    }

    // Determine price tier name for metadata
    let tierName = "Unknown";
    if (priceId === "price_individual") {
      tierName = "Individual";
    } else if (priceId === "price_business") {
      tierName = "Business";
    } else if (priceId === "price_enterprise") {
      tierName = "Enterprise";
    }
    console.log("Tier identified:", tierName);

    // Create a dynamic price based on the tier
    let amount = 1200; // $12 for Individual tier
    if (tierName === "Business") {
      amount = 2000; // $20 for Business tier
    } else if (tierName === "Enterprise") {
      amount = 4000; // $40 for Enterprise tier
    }

    // Create a temporary price (you can create permanent prices in your Stripe dashboard later)
    console.log("Creating price with amount:", amount);
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: `${tierName} Plan`,
        description: `${tierName} tier subscription`,
      },
    });
    
    console.log("Price created successfully:", price.id);
    
    console.log("Creating checkout session with price:", price.id);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        tier_name: tierName
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier_name: tierName
        }
      }
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

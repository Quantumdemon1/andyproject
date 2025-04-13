
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, creatorId, price, name, artworkId, artworkUrl } = await req.json();

    if (!type || (type !== 'subscription' && type !== 'purchase')) {
      return new Response(JSON.stringify({ error: "Invalid request type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === 'subscription' && (!creatorId || !price)) {
      return new Response(JSON.stringify({ error: "Missing required parameters for subscription" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === 'purchase' && (!name || !price)) {
      return new Response(JSON.stringify({ error: "Missing required parameters for purchase" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create a customer
    let customerId;
    const { data: existingCustomers } = await stripe.customers.search({
      query: `email:'${user.email}'`,
    });

    if (existingCustomers && existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      });
      customerId = customer.id;
    }

    let session;

    if (type === 'subscription') {
      // Get creator's Stripe account
      const { data: creatorStripeAccount } = await supabase
        .from("stripe_accounts")
        .select("stripe_account_id")
        .eq("user_id", creatorId)
        .maybeSingle();

      if (!creatorStripeAccount?.stripe_account_id) {
        return new Response(JSON.stringify({ error: "Creator not found or not connected to Stripe" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Create a subscription product and price
      const product = await stripe.products.create({
        name: "Creator Subscription",
      });

      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100), // Convert to cents
        currency: "usd",
        recurring: { interval: "month" },
      });

      // Create a Checkout session for subscription
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: stripePrice.id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/subscription-canceled`,
        metadata: {
          creator_id: creatorId,
          subscriber_id: user.id,
        },
      });

      // Store the subscription in the database
      await supabase.from("subscriptions").insert({
        subscriber_id: user.id,
        creator_id: creatorId,
        price,
        status: "pending",
      });
    } else { // type === 'purchase'
      // Insert new art purchase record
      const { data: purchase } = await supabase
        .from("art_purchases")
        .insert({
          buyer_id: user.id,
          seller_id: creatorId,
          amount: price,
          artwork_name: name,
          artwork_url: artworkUrl || null,
          status: "pending",
        })
        .select()
        .single();

      // Create a Checkout session for one-time purchase
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name,
                images: artworkUrl ? [artworkUrl] : undefined,
              },
              unit_amount: Math.round(price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/purchase-canceled`,
        metadata: {
          purchase_id: purchase.id,
          artwork_name: name,
        },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});


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

    // Check if user has a Stripe account
    const { data: stripeAccount } = await supabase
      .from("stripe_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!stripeAccount) {
      return new Response(JSON.stringify({ 
        connected: false,
        onboarded: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check with Stripe API if the account is fully onboarded
    const stripeAccountDetails = await stripe.accounts.retrieve(stripeAccount.stripe_account_id);
    const isOnboarded = stripeAccountDetails.details_submitted && 
                        stripeAccountDetails.payouts_enabled;

    // Update the database with the account status
    await supabase
      .from("stripe_accounts")
      .update({ 
        is_onboarded: isOnboarded,
        updated_at: new Date().toISOString()
      })
      .eq("id", stripeAccount.id);

    return new Response(JSON.stringify({ 
      connected: true, 
      onboarded: isOnboarded,
      accountId: stripeAccount.stripe_account_id,
      accountDetails: {
        payoutsEnabled: stripeAccountDetails.payouts_enabled,
        detailsSubmitted: stripeAccountDetails.details_submitted,
        chargesEnabled: stripeAccountDetails.charges_enabled
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking Stripe account:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

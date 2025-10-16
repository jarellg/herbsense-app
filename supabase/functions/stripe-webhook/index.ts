import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import Stripe from "npm:stripe@14.12.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeSecretKey || !stripeWebhookSecret) {
      console.error("Missing Stripe configuration");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await handleSubscriptionChange(supabase, subscription);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed for invoice:", invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("No user_id in checkout session metadata");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log(`Checkout completed for user ${userId}`);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile:", profileError);
  }

  const { error: entitlementError } = await supabase
    .from("entitlements")
    .upsert({
      user_id: userId,
      is_pro: true,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    });

  if (entitlementError) {
    console.error("Error upserting entitlement:", entitlementError);
  }
}

async function handleSubscriptionChange(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const isPro = subscription.status === "active" || subscription.status === "trialing";
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  console.log(`Subscription ${subscription.id} is ${subscription.status}`);

  const { data: entitlement, error: fetchError } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching entitlement:", fetchError);
    return;
  }

  if (!entitlement) {
    console.error("No entitlement found for customer:", customerId);
    return;
  }

  const { error: updateError } = await supabase
    .from("entitlements")
    .update({
      is_pro: isPro,
      period_end: periodEnd,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", entitlement.user_id);

  if (updateError) {
    console.error("Error updating entitlement:", updateError);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: isPro ? "pro" : "free" })
    .eq("id", entitlement.user_id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
  }
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  console.log(`Subscription ${subscription.id} deleted`);

  const { data: entitlement, error: fetchError } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (fetchError || !entitlement) {
    console.error("Error fetching entitlement for deleted subscription");
    return;
  }

  const { error: updateError } = await supabase
    .from("entitlements")
    .update({
      is_pro: false,
      period_end: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", entitlement.user_id);

  if (updateError) {
    console.error("Error updating entitlement:", updateError);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: "free" })
    .eq("id", entitlement.user_id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
  }
}

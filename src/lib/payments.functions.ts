import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { z } from "zod";

import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";

const priceIds: Record<number, string> = {
  1: "coconut_beach_soap_usd",
  2: "breathe_clear_soap_usd",
  3: "aloe_cool_cucumber_soap_usd",
  4: "slumber_soap_usd",
  5: "exfoliating_luffa_bar_usd",
  6: "lemongrass_sage_soap_usd",
  7: "rich_sandalwood_soap_usd",
  8: "oat_milk_honey_soap_usd",
  9: "calming_lavender_soap_usd",
  10: "charcoal_soap_usd",
  11: "raw_shea_butter_usd",
  12: "kojic_acid_turmeric_soap_usd",
};

const checkoutInput = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().min(1).max(12),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(12),
  subscribe: z.boolean().default(false),
  returnUrl: z.string().url(),
  environment: z.enum(["sandbox", "live"]),
});

type CheckoutResult = { clientSecret: string } | { error: string };

export const createCartCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof checkoutInput>) => checkoutInput.parse(data))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment as StripeEnv);
      const expandedItems = data.items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => item.productId),
      );
      const soapIds = expandedItems.filter((productId) => productId !== 11);
      const hasBodyCare = expandedItems.includes(11);
      if (data.subscribe && hasBodyCare)
        throw new Error("Monthly delivery is available for soap-only orders.");
      if (data.subscribe && (soapIds.length === 3 || soapIds.length === 6)) {
        throw new Error("Subscribe & Save cannot be combined with bundle pricing.");
      }

      const bundleLookupKey =
        soapIds.length === 3
          ? `build_your_own_3_bar_bundle_${data.subscribe ? "monthly_" : ""}usd`
          : soapIds.length === 6
            ? `build_your_own_6_bar_bundle_${data.subscribe ? "monthly_" : ""}usd`
            : null;
      const requestedPrices = bundleLookupKey
        ? [{ lookupKey: bundleLookupKey, quantity: 1 }]
        : data.items.map((item) => {
            const base = priceIds[item.productId];
            if (!base) throw new Error("A soap in your bag is unavailable.");
            const lookupKey =
              data.subscribe && item.productId !== 11 ? base.replace("_usd", "_monthly_usd") : base;
            return { lookupKey, quantity: item.quantity };
          });

      if (hasBodyCare && bundleLookupKey) {
        const bodyCareLookupKey = priceIds[11];
        if (!bodyCareLookupKey) throw new Error("Raw Shea Butter is unavailable.");
        requestedPrices.push({
          lookupKey: bodyCareLookupKey,
          quantity: data.items.find((item) => item.productId === 11)?.quantity ?? 1,
        });
      }

      const resolvedItems = await Promise.all(
        requestedPrices.map(async ({ lookupKey, quantity }) => {
          const prices = await stripe.prices.list({
            lookup_keys: [lookupKey],
            active: true,
            limit: 1,
          });
          const price = prices.data[0];
          if (!price) throw new Error("A soap price could not be found.");
          return { priceId: price.id, quantity, amount: (price.unit_amount ?? 0) * quantity };
        }),
      );
      const lineItems = resolvedItems.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      }));
      const merchandiseTotal = resolvedItems.reduce((sum, item) => sum + item.amount, 0);
      const shippingAmount = merchandiseTotal >= 7500 ? 0 : 795;

      const isSubscription = data.subscribe;
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode: isSubscription ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        ...(!isSubscription && { customer_creation: "always" as const }),
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: [
            "US",
            "CA",
            "MX",
            "GB",
            "IE",
            "FR",
            "DE",
            "ES",
            "IT",
            "PT",
            "NL",
            "BE",
            "LU",
            "AT",
            "CH",
            "DK",
            "SE",
            "NO",
            "FI",
            "IS",
            "PL",
            "CZ",
            "SK",
            "HU",
            "RO",
            "BG",
            "HR",
            "SI",
            "GR",
            "CY",
            "MT",
            "EE",
            "LV",
            "LT",
            "AU",
            "NZ",
            "JP",
            "SG",
            "HK",
            "MY",
            "TH",
            "PH",
            "IN",
            "AE",
            "SA",
            "ZA",
            "BR",
            "AR",
            "CL",
            "CO",
            "CR",
            "PA",
            "DO",
            "JM",
            "TT",
          ],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: shippingAmount, currency: "usd" },
              display_name: shippingAmount === 0 ? "Free shipping" : "Flat-rate shipping",
            },
          },
        ],
        // Stripe test mode requires a head office address for automatic tax;
        // enable it only for live payments.
        ...(data.environment === "live" && { automatic_tax: { enabled: true } as const }),
        metadata: {
          selected_product_ids: expandedItems.join(","),
          launch_gift: soapIds.length === 3 ? "surprise_bar" : "none",
          delivery: isSubscription ? "monthly" : "one_time",
          shipping_rate: shippingAmount === 0 ? "free" : "795",
        },
        ...(!isSubscription && {
          payment_intent_data: {
            description: bundleLookupKey
              ? `LOCKHABIT ${soapIds.length}-bar bundle`
              : "LOCKHABIT soap order",
          },
        }),
        ...(isSubscription && {
          subscription_data: {
            metadata: {
              selected_product_ids: expandedItems.join(","),
              changes_apply: "next_shipment",
            },
          },
        }),
      };
      const session = await stripe.checkout.sessions.create(checkoutParams);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

const statusInput = z.object({
  sessionId: z.string().startsWith("cs_"),
  environment: z.enum(["sandbox", "live"]),
});

export const getCheckoutStatus = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof statusInput>) => statusInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const stripe = createStripeClient(data.environment as StripeEnv);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
        expand: ["line_items.data.price.product"],
      });
      const paid = session.payment_status === "paid";

      if (paid) {
        const items =
          session.line_items?.data.map((item) => ({
            name: item.description,
            quantity: item.quantity,
            amountTotal: item.amount_total,
          })) ?? [];
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("orders").upsert(
          {
            checkout_session_id: session.id,
            payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
            customer_email: session.customer_details?.email ?? null,
            amount_total: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            payment_status: session.payment_status,
            shipping_details: session.collected_information?.shipping_details
              ? JSON.parse(JSON.stringify(session.collected_information.shipping_details))
              : null,
            items,
          },
          { onConflict: "checkout_session_id" },
        );
        if (error) throw error;
      }

      return { paid, email: session.customer_details?.email ?? null };
    } catch (error) {
      return { paid: false, error: getStripeErrorMessage(error) };
    }
  });

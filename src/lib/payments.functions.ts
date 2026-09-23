import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { z } from "zod";

import {
  createStripeClient,
  getStripeEnvironment,
  getStripeErrorMessage,
} from "@/lib/stripe.server";
import {
  parseSelectedProductIds,
  summarizeSelectedProducts,
  type SelectedOrderItem,
} from "@/lib/product-selection";

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
  // Accept legacy browser payloads, but never allow a recurring checkout.
  subscribe: z.boolean().optional(),
  returnUrl: z.string().url(),
});

type CheckoutResult = { url: string } | { error: string };

export const createCartCheckout = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof checkoutInput>) => checkoutInput.parse(data))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      if (data.subscribe === true) throw new Error("Subscriptions are not available. Please place a one-time order.");
      const environment = getStripeEnvironment();
      const stripe = createStripeClient(environment);
      const expandedItems = data.items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => item.productId),
      );
      const soapIds = expandedItems.filter((productId) => productId !== 11);
      const hasBodyCare = expandedItems.includes(11);

      const bundleLookupKey =
        soapIds.length === 3
          ? "build_your_own_3_bar_bundle_usd"
          : soapIds.length === 6
            ? "build_your_own_6_bar_bundle_usd"
            : null;
      const requestedPrices = bundleLookupKey
        ? [{ lookupKey: bundleLookupKey, quantity: 1 }]
        : data.items.map((item) => {
            const base = priceIds[item.productId];
            if (!base) throw new Error("A soap in your bag is unavailable.");
            return { lookupKey: base, quantity: item.quantity };
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

      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode: "payment",
        success_url: data.returnUrl,
        cancel_url: data.returnUrl.replace("/checkout/return?session_id={CHECKOUT_SESSION_ID}", "/"),
        customer_creation: "always",
        allow_promotion_codes: true,
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
        ...(environment === "live" && { automatic_tax: { enabled: true } as const }),
        integration_identifier: "lockhabit_zqkmwpxa",
        metadata: {
          selected_product_ids: expandedItems.join(","),
          delivery: "one_time",
          shipping_rate: shippingAmount === 0 ? "free" : "795",
        },
        payment_intent_data: {
          description: bundleLookupKey
            ? `LOCKHABIT ${soapIds.length}-bar bundle`
            : "LOCKHABIT soap order",
        },
      };
      const session = await stripe.checkout.sessions.create(checkoutParams);

      return { url: session.url ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

const statusInput = z.object({
  sessionId: z.string().startsWith("cs_"),
});

export const getCheckoutStatus = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof statusInput>) => statusInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const stripe = createStripeClient(getStripeEnvironment());
      const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
        expand: ["line_items.data.price.product"],
      });
      const paid = session.payment_status === "paid";
      const selectedIds = parseSelectedProductIds(session.metadata?.selected_product_ids);
      const lineItems = session.line_items?.data ?? [];
      const lineItemsTotal = lineItems.reduce((sum, item) => sum + (item.amount_total ?? 0), 0);
      let items: SelectedOrderItem[] = selectedIds.length
        ? summarizeSelectedProducts(selectedIds, lineItemsTotal)
        : lineItems.map((item) => ({
            name: item.description ?? "LockHabit item",
            quantity: item.quantity ?? 1,
            amountTotal: item.amount_total ?? 0,
          }));
      let orderNumber: number | null = null;
      let paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;
      let confirmationSent = false;

      if (paid) {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select(
              "order_number,payment_intent_id,items,confirmation_sent_at",
            )
            .eq("checkout_session_id", session.id)
            .maybeSingle();

          if (order) {
            orderNumber = order.order_number;
            paymentIntentId = order.payment_intent_id ?? paymentIntentId;
            confirmationSent = Boolean(order.confirmation_sent_at);
            if (Array.isArray(order.items) && order.items.length) {
              items = order.items as unknown as SelectedOrderItem[];
            }
          }
        } catch {
          // Stripe remains the source of truth for the paid return page if persistence lookup lags.
        }
      }

      return {
        paid,
        email: session.customer_details?.email ?? null,
        orderNumber,
        paymentIntentId,
        items,
        total: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        confirmationSent,
      };
    } catch (error) {
      return { paid: false, error: getStripeErrorMessage(error) };
    }
  });

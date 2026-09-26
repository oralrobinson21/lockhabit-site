import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { assertOneTimeCheckout } from "@/lib/pricing";
import { z } from "zod";

import {
  applyStackedDiscounts,
  parseOrderNumberCredential,
  shippingCentsForMerchandise,
} from "@/lib/checkout-discounts";
import { resolveCreatorAttribution } from "@/lib/creator-attribution.server";
import {
  createStripeClient,
  getStripeEnvironment,
  getStripeErrorMessage,
} from "@/lib/stripe.server";
import {
  parseSelectedProductIds,
  summarizeSelectedProducts,
  isMarketingEligibleCheckout,
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
  /** Server-validated Check-In session UUID; browser storage is never authority. */
  checkInSessionToken: z.string().uuid().optional(),
  /** Prior paid order credential for the single-use 5% reward. */
  priorOrderNumber: z.string().trim().min(1).max(32).optional(),
  /** First-party referral click token from /r/$slug. */
  attributionToken: z.string().uuid().optional(),
  /** Typed creator code overrides link attribution when valid. */
  creatorCode: z.string().trim().min(2).max(40).optional(),
});

type CheckoutResult = { url: string } | { error: string };

export const createCartCheckout = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof checkoutInput>) => checkoutInput.parse(data))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    let rewardRedemptionId: string | null = null;
    try {
      assertOneTimeCheckout(data.subscribe);
      const environment = getStripeEnvironment();
      const stripe = createStripeClient(environment);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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

      let applyCheckIn = false;
      if (data.checkInSessionToken) {
        const { data: claim, error: claimError } = await supabaseAdmin
          .from("checkin_offer_claims")
          .select("session_token")
          .eq("session_token", data.checkInSessionToken)
          .maybeSingle();
        if (claimError) throw new Error("Check-In offer could not be verified.");
        applyCheckIn = Boolean(claim);
      }

      let applyReward = false;
      let rewardOrderNumber: number | null = null;
      if (data.priorOrderNumber) {
        rewardOrderNumber = parseOrderNumberCredential(data.priorOrderNumber);
        if (!rewardOrderNumber) {
          return { error: "That previous order number does not look valid." };
        }
        const { data: reserved, error: reserveError } = await supabaseAdmin.rpc(
          "reserve_returning_customer_reward",
          { p_order_number: rewardOrderNumber },
        );
        if (reserveError) throw new Error("The returning-customer reward could not be reserved.");
        const row = reserved?.[0];
        if (!row?.ok || !row.redemption_id) {
          return {
            error:
              row?.reason === "already_used"
                ? "That previous-order reward has already been used."
                : "That previous order is not eligible for the 5% reward.",
          };
        }
        rewardRedemptionId = String(row.redemption_id);
        applyReward = true;
      }

      const stacked = applyStackedDiscounts({
        merchandiseCents: merchandiseTotal,
        applyCheckIn,
        applyReward,
      });
      const shippingAmount = shippingCentsForMerchandise(stacked.afterRewardCents);

      const attribution = await resolveCreatorAttribution(supabaseAdmin, {
        ...(data.creatorCode ? { creatorCode: data.creatorCode } : {}),
        ...(data.attributionToken ? { attributionToken: data.attributionToken } : {}),
      });

      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode: "payment",
        success_url: data.returnUrl,
        cancel_url: data.returnUrl.replace("/checkout/return?session_id={CHECKOUT_SESSION_ID}", "/"),
        customer_creation: "always",
        // LockHabit discounts own stacking when present; otherwise keep Stripe promos.
        allow_promotion_codes: stacked.totalDiscountCents === 0,
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
        ...(environment === "live" && { automatic_tax: { enabled: true } as const }),
        integration_identifier: "lockhabit_zqkmwpxa",
        metadata: {
          selected_product_ids: expandedItems.join(","),
          delivery: "one_time",
          shipping_rate: shippingAmount === 0 ? "free" : "795",
          checkin_applied: applyCheckIn ? "1" : "0",
          reward_applied: applyReward ? "1" : "0",
          reward_order_number: rewardOrderNumber ? String(rewardOrderNumber) : "",
          reward_redemption_id: rewardRedemptionId ?? "",
          checkin_session_token: data.checkInSessionToken ?? "",
          discount_labels: stacked.labels.join(" + "),
          discount_cents: String(stacked.totalDiscountCents),
          merchandise_before_discount_cents: String(merchandiseTotal),
          merchandise_after_discount_cents: String(stacked.afterRewardCents),
          creator_id: attribution?.creatorId ?? "",
          creator_code: attribution?.referralCode ?? "",
          attribution_token: attribution?.attributionToken ?? "",
          attribution_source: attribution?.source ?? "",
          commission_bps: attribution ? String(attribution.commissionBps) : "",
        },
        payment_intent_data: {
          description: bundleLookupKey
            ? `LOCKHABIT ${soapIds.length}-bar bundle`
            : "LOCKHABIT soap order",
        },
      };

      if (stacked.totalDiscountCents > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: stacked.totalDiscountCents,
          currency: "usd",
          duration: "once",
          name: stacked.labels.join(" + ").slice(0, 40) || "LockHabit discount",
          max_redemptions: 1,
          metadata: {
            lockhabit: "1",
            checkin: applyCheckIn ? "1" : "0",
            reward: applyReward ? "1" : "0",
          },
        });
        // Stripe rejects `allow_promotion_codes` (even false) alongside `discounts`.
        delete checkoutParams.allow_promotion_codes;
        checkoutParams.discounts = [{ coupon: coupon.id }];
      }

      // No cart-derived idempotency key: identical carts from different shoppers must
      // each get their own Checkout Session (a shared key returned one shopper's session
      // to another, and failed outright once discount coupons differed).
      const session = await stripe.checkout.sessions.create(checkoutParams);

      if (rewardRedemptionId) {
        const { data: bound, error: bindError } = await supabaseAdmin.rpc(
          "bind_returning_customer_reward",
          {
            p_redemption_id: rewardRedemptionId,
            p_checkout_session_id: session.id,
          },
        );
        if (bindError || !bound) {
          await supabaseAdmin.rpc("release_returning_customer_reward_by_id", {
            p_redemption_id: rewardRedemptionId,
          });
          try {
            await stripe.checkout.sessions.expire(session.id);
          } catch {
            // Session may already be unusable; reward release is the critical recovery.
          }
          throw new Error("The returning-customer reward could not be attached to checkout.");
        }
      }

      return { url: session.url ?? "" };
    } catch (error) {
      if (rewardRedemptionId) {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.rpc("release_returning_customer_reward_by_id", {
            p_redemption_id: rewardRedemptionId,
          });
        } catch {
          // Best-effort release so a failed checkout cannot permanently consume the reward.
        }
      }
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
        expand: ["line_items.data.price.product", "discounts.promotion_code"],
      });
      const paid = session.payment_status === "paid";
      const selectedIds = parseSelectedProductIds(session.metadata?.["selected_product_ids"]);
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
            .select("order_number,payment_intent_id,items,confirmation_sent_at")
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

      const paidMerchandiseCents = Math.max(
        0,
        (session.amount_total ?? 0) -
          (session.shipping_cost?.amount_total ?? 0) -
          (session.total_details?.amount_tax ?? 0),
      );
      const analyticsItems = selectedIds.length
        ? summarizeSelectedProducts(selectedIds, paidMerchandiseCents)
        : items;

      return {
        paid,
        marketingEligible: isMarketingEligibleCheckout({
          paid,
          livemode: session.livemode,
          delivery: session.metadata?.["delivery"],
          selectedProductIds: selectedIds,
          amountTotalCents: session.amount_total,
        }),
        analyticsItems,
        livemode: session.livemode,
        shippingTotal: session.shipping_cost?.amount_total ?? 0,
        taxTotal: session.total_details?.amount_tax ?? 0,
        discountAmount: session.total_details?.amount_discount ?? 0,
        discountLabels: session.metadata?.["discount_labels"] ?? "",
        checkInApplied: session.metadata?.["checkin_applied"] === "1",
        rewardApplied: session.metadata?.["reward_applied"] === "1",
        creatorAttributed: Boolean(session.metadata?.["creator_id"]),
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

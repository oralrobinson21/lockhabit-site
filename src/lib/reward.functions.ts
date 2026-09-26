import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { parseOrderNumberCredential } from "@/lib/checkout-discounts";

const validateInput = z.object({
  orderNumber: z.string().trim().min(1).max(32),
});

export const validatePriorOrderReward = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof validateInput>) => validateInput.parse(data))
  .handler(async ({ data }) => {
    const orderNumber = parseOrderNumberCredential(data.orderNumber);
    if (!orderNumber) return { eligible: false as const, reason: "invalid" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("validate_returning_customer_reward", {
      p_order_number: orderNumber,
    });
    if (error) throw new Error("Reward validation is temporarily unavailable.");
    const row = rows?.[0];
    return {
      eligible: Boolean(row?.eligible),
      orderNumber,
      reason: row?.eligible ? ("ok" as const) : ("ineligible" as const),
    };
  });

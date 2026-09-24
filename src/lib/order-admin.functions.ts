import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const accessToken = z.string().min(20).max(5000);

export const requestOrderAdminLink = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => z.object({ email: z.string().trim().email().max(254) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { emailOrderAdminLink } = await import("@/lib/order-admin.server");
      await emailOrderAdminLink(data.email);
      // Do not reveal whether the email is an allowed owner address.
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Sign-in email is unavailable. Please try later." };
    }
  });

export const requestOrderAdminPasswordCode = createServerFn({ method: "POST" })
  .validator((data: { email: string }) =>
    z.object({ email: z.string().trim().email().max(254) }).parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const { emailOrderAdminPasswordCode } = await import("@/lib/order-admin.server");
      await emailOrderAdminPasswordCode(data.email);
      // Do not reveal whether the supplied email is the configured owner address.
      return { ok: true as const };
    } catch {
      return {
        ok: false as const,
        error: "Password setup email is unavailable. Please try again later.",
      };
    }
  });

export const completeOrderAdminPasswordSetup = createServerFn({ method: "POST" })
  .validator((data: { email: string; code: string; password: string }) =>
    z
      .object({
        email: z.string().trim().email().max(254),
        code: z.string().trim().regex(/^\d{6}$/),
        password: z.string().min(12).max(128),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { setOrderAdminPassword } = await import("@/lib/order-admin.server");
    await setOrderAdminPassword(data.email, data.code, data.password);
    return { ok: true as const };
  });

export const listOwnerOrders = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => z.object({ accessToken }).parse(data))
  .handler(async ({ data }) => {
    const { readAdminOrders } = await import("@/lib/order-admin.server");
    return readAdminOrders(data.accessToken);
  });

export const saveOwnerTracking = createServerFn({ method: "POST" })
  .validator((data: {
    accessToken: string;
    orderId: string;
    carrier: "USPS" | "UPS" | "FedEx" | "DHL";
    trackingNumber: string;
    estimatedDeliveryDate: string;
  }) =>
    z.object({
      accessToken,
      orderId: z.string().uuid(),
      carrier: z.enum(["USPS", "UPS", "FedEx", "DHL"]),
      trackingNumber: z.string().trim().min(6).max(80),
      estimatedDeliveryDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).parse(data))
  .handler(async ({ data }) => {
    const { saveAdminTracking } = await import("@/lib/order-admin.server");
    return saveAdminTracking(
      data.accessToken,
      data.orderId,
      data.carrier,
      data.trackingNumber,
      data.estimatedDeliveryDate,
    );
  });

export const listOwnerRefunds = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; orderId: string }) =>
    z.object({ accessToken, orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { readAdminRefunds } = await import("@/lib/order-admin.server");
    return readAdminRefunds(data.accessToken, data.orderId);
  });

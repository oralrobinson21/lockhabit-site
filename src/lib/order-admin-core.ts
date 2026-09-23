import { trackingLink, type Carrier } from "@/lib/shipping-tracking";

export type OrderAdminIdentity = {
  email: string | null;
  emailConfirmedAt: string | null;
};

export type TrackingOrder = {
  id: string;
  orderNumber: number;
  customerEmail: string | null;
  paymentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingNotifiedAt: string | null;
};

export type RefundRecord = {
  id: string;
  amount: number;
  currency: string;
  status: string | null;
  reason: string | null;
  created: number;
};

export type PaymentReference = {
  paymentIntentId: string;
  stripeLivemode: boolean | null;
};

type LoginEmail = {
  to: string;
  code: string;
  idempotencyKey: string;
};

type TrackingEmail = {
  to: string;
  orderNumber: number;
  carrier: Carrier;
  trackingNumber: string;
  trackingUrl: string;
  idempotencyKey: string;
};

export type OrderAdminDependencies<TOrder> = {
  adminEmail: () => string | undefined;
  now: () => Date;
  getUser: (accessToken: string) => Promise<OrderAdminIdentity | null>;
  claimLogin: (email: string) => Promise<boolean>;
  createEmailOtp: (email: string) => Promise<string>;
  sendLoginEmail: (message: LoginEmail) => Promise<void>;
  listOrders: () => Promise<TOrder[]>;
  findTrackingOrder: (orderId: string) => Promise<TrackingOrder | null>;
  persistTracking: (input: {
    orderId: string;
    carrier: Carrier;
    trackingNumber: string;
    trackingUrl: string;
    shippedAt: string;
  }) => Promise<void>;
  sendTrackingEmail: (message: TrackingEmail) => Promise<boolean>;
  markTrackingNotified: (input: {
    orderId: string;
    carrier: Carrier;
    trackingNumber: string;
    notifiedAt: string;
  }) => Promise<void>;
  findPaymentReference: (orderId: string) => Promise<PaymentReference | null>;
  listRefunds: (paymentIntentId: string, mode: "sandbox" | "live") => Promise<RefundRecord[]>;
  defaultStripeMode: () => "sandbox" | "live";
  onNonFatalError?: (context: string, error: unknown) => void;
};

function normalizedAdminEmail(value: string | undefined): string {
  const address = value?.trim().toLowerCase();
  if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new Error("Order management is not configured.");
  }
  return address;
}

function ownerSignInCode(value: string): string {
  const code = value.trim();
  if (!/^\d{6}$/.test(code)) throw new Error("Sign-in code could not be created.");
  return code;
}

export function createOrderAdminService<TOrder>(dependencies: OrderAdminDependencies<TOrder>) {
  const expectedAdminEmail = () => normalizedAdminEmail(dependencies.adminEmail());

  async function requireOrderAdmin(accessToken: string): Promise<OrderAdminIdentity> {
    const user = await dependencies.getUser(accessToken);
    if (
      !user ||
      user.email?.trim().toLowerCase() !== expectedAdminEmail() ||
      !user.emailConfirmedAt
    ) {
      throw new Error("Owner sign-in is required.");
    }
    return user;
  }

  async function emailOrderAdminCode(email: string): Promise<void> {
    const ownerEmail = expectedAdminEmail();
    if (email.trim().toLowerCase() !== ownerEmail) return;
    if (!(await dependencies.claimLogin(ownerEmail))) return;

    const code = ownerSignInCode(await dependencies.createEmailOtp(ownerEmail));
    const bucket = Math.floor(dependencies.now().getTime() / 90_000) * 90_000;
    await dependencies.sendLoginEmail({
      to: ownerEmail,
      code,
      idempotencyKey: `lockhabit-admin-login-${bucket}`,
    });
  }

  async function readAdminOrders(accessToken: string): Promise<TOrder[]> {
    await requireOrderAdmin(accessToken);
    return dependencies.listOrders();
  }

  async function saveAdminTracking(
    accessToken: string,
    orderId: string,
    carrier: Carrier,
    trackingNumber: string,
  ) {
    await requireOrderAdmin(accessToken);
    const number = trackingNumber.trim().replace(/\s+/g, "");
    const url = trackingLink(carrier, number);
    const oldOrder = await dependencies.findTrackingOrder(orderId);
    if (!oldOrder || oldOrder.paymentStatus !== "paid") {
      throw new Error("A paid order was not found.");
    }

    const sameNumber = oldOrder.trackingCarrier === carrier && oldOrder.trackingNumber === number;
    if (sameNumber && oldOrder.trackingNotifiedAt) {
      return { saved: true as const, notified: true as const, trackingUrl: url };
    }

    const shippedAt = dependencies.now().toISOString();
    await dependencies.persistTracking({
      orderId,
      carrier,
      trackingNumber: number,
      trackingUrl: url,
      shippedAt,
    });

    if (!oldOrder.customerEmail) {
      return { saved: true as const, notified: false as const, trackingUrl: url };
    }

    let notified = false;
    try {
      notified = await dependencies.sendTrackingEmail({
        to: oldOrder.customerEmail,
        orderNumber: oldOrder.orderNumber,
        carrier,
        trackingNumber: number,
        trackingUrl: url,
        idempotencyKey: `lockhabit-shipping-${orderId}-${carrier}-${number}`,
      });
    } catch (error) {
      dependencies.onNonFatalError?.("tracking email delivery", error);
    }

    if (notified) {
      try {
        await dependencies.markTrackingNotified({
          orderId,
          carrier,
          trackingNumber: number,
          notifiedAt: dependencies.now().toISOString(),
        });
      } catch (error) {
        dependencies.onNonFatalError?.("tracking email receipt persistence", error);
      }
    }

    return { saved: true as const, notified, trackingUrl: url };
  }

  async function readAdminRefunds(accessToken: string, orderId: string) {
    await requireOrderAdmin(accessToken);
    const reference = await dependencies.findPaymentReference(orderId);
    if (!reference?.paymentIntentId) throw new Error("No payment reference is available.");

    const mode =
      reference.stripeLivemode === true
        ? "live"
        : reference.stripeLivemode === false
          ? "sandbox"
          : dependencies.defaultStripeMode();
    const refunds = await dependencies.listRefunds(reference.paymentIntentId, mode);
    return {
      stripeUrl: `https://dashboard.stripe.com/${mode === "sandbox" ? "test/" : ""}payments/${encodeURIComponent(reference.paymentIntentId)}`,
      refunds,
    };
  }

  return {
    requireOrderAdmin,
    emailOrderAdminCode,
    readAdminOrders,
    saveAdminTracking,
    readAdminRefunds,
  };
}

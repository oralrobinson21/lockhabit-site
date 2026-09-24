import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  completeOrderAdminPasswordSetup,
  listOwnerOrders,
  listOwnerRefunds,
  requestOrderAdminPasswordCode,
  saveOwnerTracking,
} from "@/lib/order-admin.functions";
import { SiteHeader } from "@/components/site-header";
import type { Carrier } from "@/lib/shipping-tracking";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Owner orders | LOCKHABIT Soap Co." },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: OrderAdminPage,
});

type OrderRow = Awaited<ReturnType<typeof listOwnerOrders>>[number];
type RefundView = Awaited<ReturnType<typeof listOwnerRefunds>>;
type ShipInput = { carrier: Carrier; trackingNumber: string; estimatedDeliveryDate: string };
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    value / 100,
  );
const orderLabel = (value: number) => `LH-${String(value).padStart(6, "0")}`;
function formatShippingAddress(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return "No shipping address was recorded.";
  const address = value as Record<string, unknown>;
  const text = (key: string) => (typeof address[key] === "string" ? (address[key] as string) : "");
  return (
    [
      text("line1"),
      text("line2"),
      [text("city"), text("state")].filter(Boolean).join(", "),
      text("postal_code"),
      text("country"),
    ]
      .filter(Boolean)
      .join(" · ") || "No shipping address was recorded."
  );
}
function orderItems(value: unknown): Array<{ name: string; quantity: number }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return typeof row["name"] === "string" && typeof row["quantity"] === "number"
      ? [{ name: row["name"], quantity: row["quantity"] }]
      : [];
  });
}

function OrderAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [authStatus, setAuthStatus] = useState("Checking your sign-in…");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [tracking, setTracking] = useState<Record<string, ShipInput>>({});
  const [refunds, setRefunds] = useState<Record<string, RefundView>>({});
  const [orderView, setOrderView] = useState<"needs-shipping" | "shipped">("needs-shipping");

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, "")).get("token_hash");
      if (hash) {
        window.history.replaceState(null, "", url.pathname + url.search);
        const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type: "magiclink" });
        if (error && active)
          setAuthStatus(
            "This sign-in link has expired or was already used. Request another below.",
          );
      }
      const { data } = await supabase.auth.getSession();
      if (active) {
        setAccessToken(data.session?.access_token ?? "");
        if (!data.session?.access_token && !hash) setAuthStatus("Sign in to manage your orders.");
      }
    };
    void initialize().catch(
      () => active && setAuthStatus("Sign-in could not be verified. Try again."),
    );
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAccessToken(session?.access_token ?? "");
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setOrders([]);
      return;
    }
    let active = true;
    void listOwnerOrders({ data: { accessToken } })
      .then((result) => {
        if (active) {
          setOrders(result);
          setAuthStatus("");
        }
      })
      .catch(() => {
        if (active) {
          setAccessToken("");
          setAuthStatus("Owner access could not be verified.");
        }
      });
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("login");
    setNotice("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.session?.access_token) throw error ?? new Error("No session");
      setAccessToken(data.session.access_token);
      setAuthStatus("");
    } catch {
      setNotice("Email or password is incorrect. Use “Set or reset password” if needed.");
    } finally {
      setBusy(null);
    }
  }

  async function requestPasswordCode() {
    if (!email.trim()) {
      setNotice("Enter your owner email first.");
      return;
    }
    setBusy("password-code");
    setNotice("");
    try {
      const response = await requestOrderAdminPasswordCode({ data: { email } });
      if (!response.ok) {
        setNotice(response.error);
        return;
      }
      setSetupMode(true);
      setNotice("If that address is the owner inbox, a 6-digit code is on its way. It expires in 10 minutes.");
    } catch {
      setNotice("Password setup email could not be requested.");
    } finally {
      setBusy(null);
    }
  }

  async function completePasswordSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("password-setup");
    setNotice("");
    try {
      if (newPassword !== confirmPassword) {
        setNotice("The two passwords do not match.");
        return;
      }
      await completeOrderAdminPasswordSetup({
        data: {
          email,
          code: setupCode,
          password: newPassword,
        },
      });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: newPassword,
      });
      if (error || !data.session?.access_token) throw error ?? new Error("No session");
      setPassword("");
      setSetupCode("");
      setNewPassword("");
      setConfirmPassword("");
      setSetupMode(false);
      setAccessToken(data.session.access_token);
      setAuthStatus("");
      setNotice("Password saved. You are signed in.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Password could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  async function saveShipment(order: OrderRow) {
    const input = tracking[order.id] ?? {
      carrier: (order.tracking_carrier as Carrier | null) ?? "USPS",
      trackingNumber: order.tracking_number ?? "",
      estimatedDeliveryDate: order.estimated_delivery_date ?? "",
    };
    setBusy(order.id);
    setNotice("");
    try {
      const result = await saveOwnerTracking({
        data: {
          accessToken,
          orderId: order.id,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          estimatedDeliveryDate: input.estimatedDeliveryDate,
        },
      });
      setNotice(
        result.notified
          ? `${orderLabel(order.order_number)} marked shipped. Tracking and estimated delivery were emailed to the customer.`
          : `${orderLabel(order.order_number)} marked shipped. Customer email was not sent; check email configuration and retry.`,
      );
      setOrders(await listOwnerOrders({ data: { accessToken } }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tracking could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  const needsShippingOrders = orders.filter((order) => order.fulfillment_status !== "shipped");
  const shippedOrders = orders.filter((order) => order.fulfillment_status === "shipped");
  const visibleOrders = orderView === "shipped" ? shippedOrders : needsShippingOrders;

  async function inspectRefunds(order: OrderRow) {
    setBusy(order.id);
    setNotice("");
    try {
      const result = await listOwnerRefunds({ data: { accessToken, orderId: order.id } });
      setRefunds((current) => ({ ...current, [order.id]: result }));
    } catch {
      setNotice("Refund status could not be loaded. You can check the payment in Stripe.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
        <p className="eyebrow">Owner access · private</p>
        <h1 className="section-title">
          Orders &<br />
          <em>shipping.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Paid orders are recorded automatically from Stripe. LockHabit does not buy a shipping
          label or create a carrier tracking number yet. Enter the number from your carrier or
          shipping-label service, add the estimated delivery date, then mark the order shipped.
          LockHabit moves it into the Shipped section and emails the customer the tracking link and
          estimated delivery date automatically. Check or issue refunds in your existing Stripe Dashboard.
        </p>

        {!accessToken ? (
          <div className="paper-card mt-10 grid max-w-xl gap-4 p-5 sm:p-8">
            <p className="text-sm text-muted-foreground">{authStatus}</p>
            {!setupMode ? (
              <form onSubmit={login} className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold">
                  Owner email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your owner email"
                    className="w-full rounded-xl border-2 border-foreground/35 bg-background px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Password
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-xl border-2 border-foreground/35 bg-background px-4 py-3"
                  />
                </label>
                <button type="submit" disabled={busy === "login"} className="primary-button">
                  {busy === "login" ? "Signing in…" : "Sign in"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy === "password-code"}
                  onClick={() => void requestPasswordCode()}
                >
                  {busy === "password-code" ? "Sending code…" : "Set or reset password"}
                </button>
              </form>
            ) : (
              <form onSubmit={completePasswordSetup} className="grid gap-4">
                <p className="text-sm font-semibold">Create your owner password</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  Enter the 6-digit code from your email, then choose a password with at least 12
                  characters. This replaces the unreliable email-link login.
                </p>
                <label className="grid gap-2 text-sm font-semibold">
                  Verification code
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl border-2 border-foreground/35 bg-background px-4 py-3 tracking-[0.35em]"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-foreground/35 bg-background px-4 py-3"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Confirm password
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-foreground/35 bg-background px-4 py-3"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy === "password-setup"}
                  className="primary-button"
                >
                  {busy === "password-setup" ? "Saving password…" : "Save password & sign in"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSetupMode(false);
                    setSetupCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Back to sign in
                </button>
              </form>
            )}
            {notice ? (
              <p role="status" className="text-sm">
                {notice}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Access is restricted to the configured owner inbox. Order data is never publicly
              listed.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="memo">
                {needsShippingOrders.length} need shipping · {shippedOrders.length} shipped
              </p>
              <div className="flex gap-3">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setBusy("refresh");
                    void listOwnerOrders({ data: { accessToken } })
                      .then(setOrders)
                      .finally(() => setBusy(null));
                  }}
                  disabled={busy === "refresh"}
                >
                  Refresh orders
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void supabase.auth.signOut()}
                >
                  Sign out
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3" role="tablist" aria-label="Order status">
              <button
                type="button"
                role="tab"
                aria-selected={orderView === "needs-shipping"}
                className={orderView === "needs-shipping" ? "primary-button" : "secondary-button"}
                onClick={() => setOrderView("needs-shipping")}
              >
                Needs shipping ({needsShippingOrders.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={orderView === "shipped"}
                className={orderView === "shipped" ? "primary-button" : "secondary-button"}
                onClick={() => setOrderView("shipped")}
              >
                Shipped ({shippedOrders.length})
              </button>
            </div>
            {notice ? (
              <p role="status" className="my-5 rounded-xl border border-foreground/20 p-4 text-sm">
                {notice}
              </p>
            ) : null}
            <div className="mt-7 grid gap-5">
              {visibleOrders.length === 0 ? (
                <div className="paper-card p-8">
                  {orderView === "shipped" ? "No shipped orders yet." : "No orders are waiting to ship."}
                </div>
              ) : null}
              {visibleOrders.map((order) => {
                const input = tracking[order.id] ?? {
                  carrier: (order.tracking_carrier as Carrier | null) ?? "USPS",
                  trackingNumber: order.tracking_number ?? "",
                  estimatedDeliveryDate: order.estimated_delivery_date ?? "",
                };
                const refund = refunds[order.id];
                return (
                  <article key={order.id} className="paper-card min-w-0 p-5 sm:p-7">
                    <div className="flex flex-wrap justify-between gap-4 border-b border-foreground/15 pb-4">
                      <div>
                        <h2 className="font-display text-xl font-semibold">
                          {orderLabel(order.order_number)}
                        </h2>
                        <p className="mt-1 break-all text-sm">
                          {order.customer_name ?? "Customer"} ·{" "}
                          {order.customer_email ?? "No customer email"}
                        </p>
                        <p className="memo mt-2">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-sm sm:text-right">
                        <p className="font-bold">{money(order.amount_total, order.currency)}</p>
                        <p className="mt-1">
                          {order.payment_status} · {order.fulfillment_status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="memo mb-1">Ship to</p>
                        <p className="break-words leading-6">
                          {formatShippingAddress(order.shipping_details)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="memo mb-1">Items</p>
                        {orderItems(order.items).map((item, index) => (
                          <p key={`${index}-${item.name}`} className="leading-6">
                            {item.quantity} × {item.name}
                          </p>
                        ))}
                      </div>
                    </div>
                    {order.tracking_url ? (
                      <p className="mt-4 text-sm">
                        Tracking:{" "}
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all underline underline-offset-4"
                        >
                          {order.tracking_carrier} · {order.tracking_number}
                        </a>
                        {order.estimated_delivery_date
                          ? ` · ETA ${new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC",
                            }).format(new Date(`${order.estimated_delivery_date}T12:00:00.000Z`))}`
                          : ""}
                        {order.tracking_notified_at ? " · customer notified" : " · email pending"}
                      </p>
                    ) : null}
                    <div className="mt-5 grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)_190px_auto] sm:items-end">
                      <label className="grid gap-2 text-sm font-semibold">
                        Carrier
                        <select
                          value={input.carrier}
                          onChange={(e) =>
                            setTracking((old) => ({
                              ...old,
                              [order.id]: { ...input, carrier: e.target.value as Carrier },
                            }))
                          }
                          className="rounded-xl border border-foreground/35 bg-background px-3 py-3"
                        >
                          {(["USPS", "UPS", "FedEx", "DHL"] as const).map((carrier) => (
                            <option key={carrier} value={carrier}>
                              {carrier}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid min-w-0 gap-2 text-sm font-semibold">
                        Tracking number
                        <input
                          value={input.trackingNumber}
                          onChange={(e) =>
                            setTracking((old) => ({
                              ...old,
                              [order.id]: { ...input, trackingNumber: e.target.value },
                            }))
                          }
                          maxLength={80}
                          autoComplete="off"
                          placeholder="From your carrier's shipping label"
                          className="w-full min-w-0 rounded-xl border border-foreground/35 bg-background px-3 py-3"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">
                        Estimated delivery
                        <input
                          type="date"
                          value={input.estimatedDeliveryDate}
                          onChange={(e) =>
                            setTracking((old) => ({
                              ...old,
                              [order.id]: { ...input, estimatedDeliveryDate: e.target.value },
                            }))
                          }
                          required
                          className="w-full rounded-xl border border-foreground/35 bg-background px-3 py-3"
                        />
                      </label>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          busy === order.id ||
                          order.payment_status !== "paid" ||
                          !input.trackingNumber.trim() ||
                          !input.estimatedDeliveryDate
                        }
                        onClick={() => void saveShipment(order)}
                      >
                        {busy === order.id
                          ? "Working…"
                          : order.fulfillment_status === "shipped"
                            ? "Update & email"
                            : "Mark shipped & email"}
                      </button>
                    </div>
                    <div className="mt-5 border-t border-foreground/15 pt-4">
                      <button
                        type="button"
                        className="text-sm font-bold underline underline-offset-4"
                        disabled={busy === order.id}
                        onClick={() => void inspectRefunds(order)}
                      >
                        Check refunds & open Stripe
                      </button>
                      {refund ? (
                        <div className="mt-3 text-sm">
                          <a
                            href={refund.stripeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold underline underline-offset-4"
                          >
                            Open payment in Stripe for a refund ↗
                          </a>
                          {refund.refunds.length ? (
                            refund.refunds.map((r) => (
                              <p key={r.id} className="mt-2">
                                Refund {r.id}: {money(r.amount, r.currency)} · {r.status}
                              </p>
                            ))
                          ) : (
                            <p className="mt-2 text-muted-foreground">
                              No refunds currently recorded for this payment.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
        <Link to="/" className="mt-10 inline-block text-sm underline underline-offset-4">
          Return to storefront
        </Link>
      </section>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getOwnerGrowth,
  getOwnerCreatorActivity,
  inviteOwnerCreator,
  saveOwnerCreator,
  saveOwnerProspect,
  transitionOwnerPayout,
} from "@/lib/owner-growth.functions";

export const Route = createFileRoute("/owner/creator-program")({
  head: () => ({
    meta: [
      { title: "Creator administration · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: OwnerCreators,
});

type Data = Awaited<ReturnType<typeof getOwnerGrowth>>;
type Activity = Awaited<ReturnType<typeof getOwnerCreatorActivity>>;
const money = (c: number) => `$${(c / 100).toFixed(2)}`;

function OwnerCreators() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [notice, setNotice] = useState("Checking owner access…");
  const [tab, setTab] = useState<"creators" | "payouts" | "outreach">("creators");
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<{ id: string; data: Activity } | null>(null);
  const [activityLoading, setActivityLoading] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data: session }) => {
      if (active) setToken(session.session?.access_token ?? "");
      if (active && !session.session) setNotice("Sign in to the owner orders dashboard first.");
    });
    return () => {
      active = false;
    };
  }, []);
  const refresh = useCallback(async (accessToken = token) => {
    try {
      setData(await getOwnerGrowth({ data: { accessToken } }));
      setNotice("");
    } catch {
      setData(null);
      setNotice("Owner access is required. Sign in through the orders dashboard.");
    }
  }, [token]);
  useEffect(() => {
    if (token) void refresh(token);
  }, [token, refresh]);
  async function createCreator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const slug = String(form.get("slug") || "")
      .trim()
      .toLowerCase();
    try {
      await saveOwnerCreator({
        data: {
          accessToken: token,
          displayName: name,
          email,
          slug,
          code: slug.replace(/-/g, "").toUpperCase(),
          status: "applicant",
          commissionBps: 1000,
        },
      });
      event.currentTarget.reset();
      await refresh();
      setNotice("Applicant saved. Approve after reviewing their details.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save creator.");
    } finally {
      setBusy(false);
    }
  }
  async function updateCreator(
    creator: Data["creators"][number],
    status: "applicant" | "approved" | "active" | "paused",
    rate = creator.commission_bps,
  ) {
    setBusy(true);
    try {
      await saveOwnerCreator({
        data: { accessToken: token, id: creator.id, status, commissionBps: rate },
      });
      await refresh();
      setNotice("Creator saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save creator.");
    } finally {
      setBusy(false);
    }
  }
  async function toggleActivity(id: string) {
    if (activity?.id === id) { setActivity(null); return; }
    setActivity(null);
    setActivityLoading(id);
    try {
      const result = await getOwnerCreatorActivity({ data: { accessToken: token, creatorId: id } });
      setActivity({ id, data: result });
    } catch {
      setNotice("Creator activity could not be loaded.");
    } finally {
      setActivityLoading(null);
    }
  }
  async function updateCompliance(
    creator: Data["creators"][number],
    values: {
      taxStatus?: "not_required" | "requested" | "complete" | "blocked";
      payoutStatus?: "not_ready" | "ready" | "blocked";
    },
  ) {
    setBusy(true);
    try {
      await saveOwnerCreator({
        data: {
          accessToken: token,
          id: creator.id,
          status: creator.status as "applicant" | "approved" | "active" | "paused",
          commissionBps: creator.commission_bps,
          ...values,
        },
      });
      await refresh();
      setNotice("Compliance status saved. Keep tax documents in a secure tax workflow.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save compliance status.");
    } finally {
      setBusy(false);
    }
  }
  async function createProspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await saveOwnerProspect({
        data: {
          accessToken: token,
          name: String(form.get("name")),
          platform: String(form.get("platform")),
          contact: String(form.get("contact")),
          stage: "prospect",
        },
      });
      event.currentTarget.reset();
      await refresh();
      setNotice("Prospect saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save prospect.");
    } finally {
      setBusy(false);
    }
  }
  async function changePayout(id: string, action: "approve" | "reject" | "paid") {
    const note = window.prompt(
      action === "paid"
        ? "External payment method and transaction reference"
        : "Owner note (optional)",
      "",
    );
    if (note === null || (action === "paid" && !note.trim())) return;
    setBusy(true);
    try {
      await transitionOwnerPayout({ data: { accessToken: token, payoutId: id, action, note } });
      await refresh();
      setNotice("Payout status updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update payout.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#f5efe2] px-5 py-8 text-foreground lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-bold">
            LOCKHABIT
          </Link>
          <Link to="/admin/orders" className="secondary-button">
            Owner orders & sign in
          </Link>
        </div>
        <p className="eyebrow mt-9">Owner tools</p>
        <h1 className="section-title">Creator program.</h1>
        {notice ? (
          <p role="status" className="mt-4 rounded-xl bg-paper p-4">
            {notice}
          </p>
        ) : null}
        {!data ? (
          <p className="mt-4">Creator data is available after owner sign in.</p>
        ) : (
          <>
            <div className="mt-7 flex gap-2 overflow-x-auto">
              {(["creators", "payouts", "outreach"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className="secondary-button capitalize"
                  aria-current={tab === item ? "page" : undefined}
                  onClick={() => setTab(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {tab === "creators" ? (
              <section className="mt-6 space-y-5">
                <form
                  onSubmit={createCreator}
                  className="flex flex-wrap items-end gap-3 rounded-2xl bg-paper p-5"
                  aria-label="Add creator applicant"
                >
                  <label>
                    Name
                    <input
                      name="name"
                      required
                      maxLength={120}
                      className="block rounded border p-2"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      name="email"
                      required
                      type="email"
                      className="block rounded border p-2"
                    />
                  </label>
                  <label>
                    Referral slug
                    <input
                      name="slug"
                      required
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      className="block rounded border p-2"
                    />
                  </label>
                  <button disabled={busy} className="primary-button">
                    Add applicant
                  </button>
                </form>
                {data.creators.length === 0 ? (
                  <p>No creator applicants yet.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.creators.map((c) => (
                      <article
                        key={c.id}
                        className="rounded-2xl border-2 border-foreground bg-paper p-5"
                      >
                        <h2 className="font-display text-2xl">{c.display_name}</h2>
                        <p>
                          {c.email} · {c.status}
                        </p>
                        <p className="mt-2 text-sm">
                          lockhabit.com/r/{c.referral_slug} · Code {c.referral_code} ·{" "}
                          {(c.commission_bps / 100).toFixed(2)}%
                        </p>
                        <p className="mt-2 text-sm">
                          Tax: {c.tax_status} · Payout: {c.payout_status} · Agreement:{" "}
                          {c.agreement_accepted_at ? "accepted" : "pending"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          <label>
                            Tax status{" "}
                            <select
                              disabled={busy}
                              value={c.tax_status}
                              className="ml-2 rounded border p-2"
                              onChange={(event) =>
                                void updateCompliance(c, {
                                  taxStatus: event.target.value as
                                    "not_required" | "requested" | "complete" | "blocked",
                                })
                              }
                            >
                              {["not_required", "requested", "complete", "blocked"].map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Payout readiness{" "}
                            <select
                              disabled={busy}
                              value={c.payout_status}
                              className="ml-2 rounded border p-2"
                              onChange={(event) =>
                                void updateCompliance(c, {
                                  payoutStatus: event.target.value as
                                    "not_ready" | "ready" | "blocked",
                                })
                              }
                            >
                              {["not_ready", "ready", "blocked"].map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="secondary-button"
                            aria-expanded={activity?.id === c.id}
                            onClick={() => void toggleActivity(c.id)}
                          >
                            {activityLoading === c.id ? "Loading…" : activity?.id === c.id ? "Hide activity" : "View sales & activity"}
                          </button>
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => void updateCreator(c, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => void updateCreator(c, "active")}
                          >
                            Activate
                          </button>
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => void updateCreator(c, "paused")}
                          >
                            Pause
                          </button>
                          <button
                            disabled={busy || !["approved", "active"].includes(c.status)}
                            className="secondary-button"
                            onClick={async () => {
                              setBusy(true);
                              try {
                                await inviteOwnerCreator({
                                  data: { accessToken: token, creatorId: c.id },
                                });
                                await refresh();
                                setNotice("Creator invite sent.");
                              } catch (error) {
                                setNotice(
                                  error instanceof Error ? error.message : "Invite failed.",
                                );
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            Send invite
                          </button>
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => {
                              const input = window.prompt(
                                "Commission rate as a percent",
                                String(c.commission_bps / 100),
                              );
                              if (input !== null && Number.isFinite(Number(input)))
                                void updateCreator(
                                  c,
                                  c.status as "applicant" | "approved" | "active" | "paused",
                                  Math.round(Number(input) * 100),
                                );
                            }}
                          >
                            Edit rate
                          </button>
                        </div>
                        {activity?.id === c.id ? (
                          <div className="mt-5 space-y-4 border-t border-foreground/20 pt-4 text-sm">
                            <p><b>{activity.data.clicks}</b> referral clicks · <b>{activity.data.sales.length}</b> recent paid orders</p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <caption className="mb-2 text-left font-bold">Paid orders (latest 100)</caption>
                                <thead><tr><th>Order</th><th>Paid</th><th className="text-right">Merchandise</th></tr></thead>
                                <tbody>{activity.data.sales.map((sale) => <tr key={sale.id} className="border-t">
                                  <td>{sale.order_number ? `LH-${String(sale.order_number).padStart(6, "0")}` : "Pending reference"}</td>
                                  <td>{new Date(sale.paid_at).toLocaleDateString()}</td>
                                  <td className="text-right">{money(sale.paid_merchandise_cents)}</td>
                                </tr>)}</tbody>
                              </table>
                              {!activity.data.sales.length ? <p className="mt-2">No paid orders yet.</p> : null}
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <caption className="mb-2 text-left font-bold">Commission ledger (latest 100)</caption>
                                <thead><tr><th>Date</th><th>Entry</th><th>Status</th><th className="text-right">Amount</th></tr></thead>
                                <tbody>{activity.data.ledger.map((item) => <tr key={item.id} className="border-t">
                                  <td>{new Date(item.created_at).toLocaleDateString()}</td><td>{item.entry_type}</td><td>{item.status}</td>
                                  <td className="text-right">{money(item.amount_cents)}</td>
                                </tr>)}</tbody>
                              </table>
                              {!activity.data.ledger.length ? <p className="mt-2">No commission entries yet.</p> : null}
                            </div>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : null}
            {tab === "payouts" ? (
              <section className="mt-6 space-y-3">
                <h2 className="font-display text-3xl">Payout requests</h2>
                <p>
                  Requests are held for owner review. Record external payment details only after
                  sending funds outside this app.
                </p>
                {data.payouts.length === 0 ? (
                  <p>No payout requests yet.</p>
                ) : (
                  data.payouts.map((p) => (
                    <article
                      key={p.id}
                      className="rounded-xl border-2 border-foreground bg-paper p-4"
                    >
                      <div>
                        {data.creators.find((c) => c.id === p.creator_id)?.display_name ??
                          "Creator"}{" "}
                        · {money(p.amount_cents)} · {p.status} ·{" "}
                        {new Date(p.requested_at).toLocaleDateString()}
                      </div>
                      {p.owner_note ? (
                        <p className="mt-1 text-sm">Reference: {p.owner_note}</p>
                      ) : null}
                      <div className="mt-3 flex gap-2">
                        {p.status === "requested" ? (
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => void changePayout(p.id, "approve")}
                          >
                            Approve
                          </button>
                        ) : null}
                        {["requested", "approved"].includes(p.status) ? (
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => void changePayout(p.id, "reject")}
                          >
                            Reject
                          </button>
                        ) : null}
                        {p.status === "approved" ? (
                          <button
                            disabled={busy}
                            className="secondary-button"
                            onClick={() => void changePayout(p.id, "paid")}
                          >
                            Record paid
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))
                )}
              </section>
            ) : null}
            {tab === "outreach" ? (
              <section className="mt-6 space-y-4">
                <form
                  onSubmit={createProspect}
                  className="flex flex-wrap items-end gap-3 rounded-2xl bg-paper p-5"
                >
                  <label>
                    Name or brand
                    <input name="name" required className="block rounded border p-2" />
                  </label>
                  <label>
                    Platform
                    <input name="platform" className="block rounded border p-2" />
                  </label>
                  <label>
                    Contact
                    <input name="contact" className="block rounded border p-2" />
                  </label>
                  <button disabled={busy} className="primary-button">
                    Add prospect
                  </button>
                </form>
                {data.outreach.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-xl border-2 border-foreground bg-paper p-4"
                  >
                    <strong>{p.name_or_brand}</strong> · {p.platform} · {p.stage}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        ["contacted", "responded", "interested", "approved", "active"] as const
                      ).map((stage) => (
                        <button
                          key={stage}
                          className="secondary-button capitalize"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await saveOwnerProspect({
                                data: {
                                  accessToken: token,
                                  id: p.id,
                                  name: p.name_or_brand,
                                  platform: p.platform ?? "",
                                  contact: p.contact ?? "",
                                  profileUrl: p.profile_url ?? "",
                                  niche: p.niche ?? "",
                                  notes: p.notes ?? "",
                                  stage,
                                },
                              });
                              await refresh();
                            } catch {
                              setNotice("Could not update prospect.");
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {stage}
                        </button>
                      ))}
                      {p.stage === "interested" &&
                      !p.creator_id &&
                      p.contact &&
                      /.+@.+\..+/.test(p.contact) ? (
                        <button
                          disabled={busy}
                          className="primary-button"
                          onClick={async () => {
                            setBusy(true);
                            try {
                              const slug =
                                p.name_or_brand
                                  .toLowerCase()
                                  .normalize("NFKD")
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-|-$/g, "") || "creator";
                              const creator = await saveOwnerCreator({
                                data: {
                                  accessToken: token,
                                  email: p.contact!,
                                  displayName: p.name_or_brand,
                                  slug,
                                  code: slug.replace(/-/g, "").toUpperCase(),
                                  status: "approved",
                                  commissionBps: 1000,
                                },
                              });
                              await saveOwnerProspect({
                                data: {
                                  accessToken: token,
                                  id: p.id,
                                  creatorId: creator.id,
                                  name: p.name_or_brand,
                                  platform: p.platform ?? "",
                                  contact: p.contact ?? "",
                                  profileUrl: p.profile_url ?? "",
                                  niche: p.niche ?? "",
                                  notes: p.notes ?? "",
                                  stage: "approved",
                                },
                              });
                              await refresh();
                              setNotice("Creator approved. Send the invite from Creators.");
                            } catch (error) {
                              setNotice(
                                error instanceof Error
                                  ? error.message
                                  : "Could not approve prospect.",
                              );
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          Approve creator
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { SiteHeader } from "@/components/site-header";
import { unsubscribeNewsletter } from "@/lib/newsletter.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) =>
    z.object({ token: z.string().uuid().optional() }).parse({
      token: typeof search["token"] === "string" ? search["token"] : undefined,
    }),
  head: () => ({
    meta: [
      { title: "Unsubscribe · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    token ? "idle" : "error",
  );
  const [message, setMessage] = useState(
    token ? "One click removes you from LockHabit postcards." : "That unsubscribe link is missing.",
  );

  async function confirm() {
    if (!token) return;
    setStatus("working");
    const result = await unsubscribeNewsletter({ data: { token } });
    if (result.ok) {
      setStatus("done");
      setMessage("You’re unsubscribed. No more marketing postcards from this list.");
    } else {
      setStatus("error");
      setMessage(result.error ?? "Unsubscribe could not be completed.");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
        <p className="eyebrow">Guest list</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Unsubscribe</h1>
        <p className="mt-4 text-muted-foreground">{message}</p>
        {status === "idle" || status === "working" ? (
          <button
            type="button"
            className="dark-button mt-8"
            disabled={status === "working"}
            onClick={() => void confirm()}
          >
            {status === "working" ? "Working…" : "Unsubscribe me"}
          </button>
        ) : null}
        <Link to="/" className="secondary-button mt-6">
          Back to the shop
        </Link>
      </section>
    </main>
  );
}

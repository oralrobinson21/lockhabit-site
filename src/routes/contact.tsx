import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { BrandInfoPage } from "@/components/brand-info-page";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | LOCKHABIT SOAP CO." },
      {
        name: "description",
        content:
          "The LOCKHABIT front desk: order help, product questions, and responsible amounts of soap indecision.",
      },
    ],
  }),
  component: Contact,
});

const FRONT_DESK_COOLDOWN_MS = 60_000;
const FRONT_DESK_LAST_SENT_KEY = "lockhabit:front-desk:last-sent";

function FrontDeskForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastSentAt, setLastSentAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(FRONT_DESK_LAST_SENT_KEY) ?? 0);
      if (Number.isFinite(saved) && saved > 0) setLastSentAt(saved);
    } catch {
      // Storage can be unavailable in private/restricted browsers.
    }
  }, []);

  useEffect(() => {
    if (!lastSentAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [lastSentAt]);

  const cooldownRemaining = Math.max(
    0,
    Math.ceil((FRONT_DESK_COOLDOWN_MS - (now - lastSentAt)) / 1000),
  );
  const coolingDown = cooldownRemaining > 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (coolingDown) {
      setStatus("sent");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("sending");
    setMessage("");

    const result = await sendContactMessage({
      data: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        orderNumber: String(form.get("orderNumber") ?? ""),
        message: String(form.get("message") ?? ""),
        website: String(form.get("website") ?? ""),
      },
    });

    if (result.ok) {
      const sentAt = Date.now();
      setLastSentAt(sentAt);
      setNow(sentAt);
      try {
        window.localStorage.setItem(FRONT_DESK_LAST_SENT_KEY, String(sentAt));
      } catch {
        // Non-fatal; the page-session cooldown still works.
      }

      formElement.reset();
      setStatus("sent");
      setMessage("Message checked in.");
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4" aria-label="Contact LOCKHABIT support">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Name
          <Input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <Input name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Order number <span className="font-normal text-muted-foreground">(if you have one)</span>
        <Input name="orderNumber" maxLength={80} placeholder="LH-000123" />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        What can we help with?
        <Textarea name="message" required minLength={10} maxLength={3000} rows={7} />
      </label>

      <label className="hidden" aria-hidden="true">
        Website
        <Input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {status === "sent" ? (
        <div className="front-desk-confirmation" role="status" aria-live="polite">
          <div className="front-desk-bell" aria-hidden="true">
            <svg viewBox="0 0 120 86" role="presentation">
              <path d="M20 62h80" />
              <path d="M30 58c2-25 15-38 30-38s28 13 30 38" />
              <path d="M54 18c0-5 2-8 6-8s6 3 6 8" />
              <path d="M14 68h92c4 0 7 3 7 7v2H7v-2c0-4 3-7 7-7Z" />
            </svg>
            <span className="front-desk-bell-ring front-desk-bell-ring-one" />
            <span className="front-desk-bell-ring front-desk-bell-ring-two" />
          </div>

          <div>
            <p className="memo text-coral">Ding! The front desk has your note.</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">Thanks for checking in.</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We received your message and will get back to you as soon as possible.
            </p>

            {coolingDown ? (
              <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-primary">
                Another note can be sent in {cooldownRemaining}s
              </p>
            ) : (
              <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-primary">
                The bell is ready again if you need to send another note.
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="primary-button"
          disabled={status === "sending" || coolingDown}
          aria-disabled={status === "sending" || coolingDown}
        >
          {status === "sending"
            ? "Sending…"
            : coolingDown
              ? `Front desk resting · ${cooldownRemaining}s`
              : "Send to the front desk"}
        </button>

        {status === "error" && message ? (
          <p className="text-sm text-destructive" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Contact() {
  return (
    <BrandInfoPage
      eyebrow="The front desk"
      title="The lobby bell is decorative. This form works better."
      intro="Need help with an order or stuck between two bars? Send us a note here. A real support inbox is waiting on the other side."
      sections={[
        {
          title: "Send a note",
          body: <FrontDeskForm />,
        },
        {
          title: "Scent indecision",
          body: (
            <p>
              Tell us what you usually like — fresh, warm, herbal, floral, clean, “anything except
              lavender” — and we’ll point you toward the right shelf.
            </p>
          ),
        },
        {
          title: "Response time",
          body: (
            <p>
              We answer as soon as we can. If you already ordered, include your LOCKHABIT order
              number so we can find your suitcase faster.
            </p>
          ),
        },
      ]}
    />
  );
}

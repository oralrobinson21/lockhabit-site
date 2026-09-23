import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

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

function FrontDeskForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
      setStatus("sent");
      event.currentTarget.reset();
      setMessage("Message checked in. The front desk will get back to you as soon as possible.");
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
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="primary-button" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send to the front desk"}
        </button>
        {message ? (
          <p className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
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

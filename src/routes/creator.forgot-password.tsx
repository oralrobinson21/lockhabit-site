import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CreatorAuthShell } from "@/components/creator-auth-shell";
import { requestCreatorPasswordReset } from "@/lib/creator.functions";

export const Route = createFileRoute("/creator/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Creator Password · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ForgotCreatorPassword,
});
function ForgotCreatorPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await requestCreatorPasswordReset({ data: { email: email.trim() } });
    setSent(true);
    setBusy(false);
  }
  return (
    <CreatorAuthShell
      eyebrow="Account recovery"
      title="Reset your key."
      description="Enter the creator email on file. If it belongs to an approved creator, use the secure email from LockHabit to choose a new password."
      footer={
        <p className="text-sm">
          <Link to="/creator/login" className="font-black underline underline-offset-4">
            ← Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        <div>
          <label htmlFor="reset-email" className="memo block">
            Creator email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3"
            placeholder="creator@example.com"
          />
        </div>
        <button disabled={busy || sent} className="dark-button w-full justify-center">
          <Mail size={17} />
          {busy ? "Sending…" : sent ? "Check your email" : "Send reset link"}
        </button>
        {sent ? (
          <p role="status" className="text-sm">
            If that email has creator access, a secure reset message is on the way.
          </p>
        ) : null}
      </form>
    </CreatorAuthShell>
  );
}

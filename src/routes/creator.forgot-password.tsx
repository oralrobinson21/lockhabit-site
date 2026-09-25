import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { CreatorAuthShell } from "@/components/creator-auth-shell";

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
  return (
    <CreatorAuthShell
      eyebrow="Account recovery"
      title="Reset your key."
      description="Enter the creator email on file. LockHabit will send a secure reset link when the production authentication wiring is connected."
      footer={<p className="text-sm"><Link to="/creator/login" className="font-black underline underline-offset-4">← Back to sign in</Link></p>}
    >
      <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="reset-email" className="memo block">Creator email</label>
          <input id="reset-email" type="email" autoComplete="email" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="creator@example.com" />
        </div>
        <button className="dark-button w-full justify-center"><Mail size={17} /> Send reset link</button>
      </form>
    </CreatorAuthShell>
  );
}

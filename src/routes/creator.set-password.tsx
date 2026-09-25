import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

import { CreatorAuthShell } from "@/components/creator-auth-shell";

export const Route = createFileRoute("/creator/set-password")({
  head: () => ({
    meta: [
      { title: "Set Creator Password · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SetCreatorPassword,
});

function SetCreatorPassword() {
  return (
    <CreatorAuthShell
      eyebrow="First login"
      title="Make the account yours."
      description="Use the one-time creator invite from LockHabit, then replace the temporary password with one you choose."
      footer={<p className="text-sm text-muted-foreground">Already set it? <Link to="/creator/login" className="font-black text-foreground underline underline-offset-4">Sign in</Link></p>}
    >
      <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="temporary-password" className="memo block">Temporary password</label>
          <input id="temporary-password" type="password" autoComplete="one-time-code" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="From your LockHabit invite" />
        </div>
        <div>
          <label htmlFor="new-password" className="memo block">New password</label>
          <input id="new-password" type="password" autoComplete="new-password" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="Choose a strong password" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="memo block">Confirm new password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" className="mt-2 w-full rounded-full border-2 border-foreground bg-background px-4 py-3" placeholder="Type it again" />
        </div>
        <button className="dark-button w-full justify-center"><KeyRound size={17} /> Save password & continue</button>
      </form>
    </CreatorAuthShell>
  );
}

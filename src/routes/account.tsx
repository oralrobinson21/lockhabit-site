import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { resolvePortalAccess } from "@/lib/portal-access.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account · LOCKHABIT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReaderAccount,
});

function ReaderAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState("Checking your session…");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session?.access_token) {
        void navigate({ to: "/sign-in", replace: true });
        return;
      }
      const access = await resolvePortalAccess({
        data: { accessToken: data.session.access_token },
      });
      if (!active) return;
      if (access.destination === "owner") {
        void navigate({ to: "/admin/orders", replace: true });
        return;
      }
      if (access.destination === "creator") {
        void navigate({ to: "/creator", replace: true });
        return;
      }
      if (access.destination !== "reader") {
        await supabase.auth.signOut();
        void navigate({ to: "/sign-in", replace: true });
        return;
      }
      setEmail(data.session.user.email ?? null);
      setNotice("");
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-5 py-16">
        <p className="eyebrow">Reader desk</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Your LockHabit account</h1>
        {notice ? <p className="mt-4 text-muted-foreground">{notice}</p> : null}
        {email ? (
          <div className="mt-8 rounded-2xl border-2 border-foreground bg-paper p-6">
            <p className="memo">Signed in as</p>
            <p className="mt-2 font-display text-2xl font-semibold">{email}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This reader account can comment on Journal articles when comments are open. It cannot
              reach owner or creator tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/journal" className="primary-button">
                Open the Journal
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  void supabase.auth.signOut().then(() => navigate({ to: "/", replace: true }));
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

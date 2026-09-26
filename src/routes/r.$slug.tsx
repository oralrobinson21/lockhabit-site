import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureCreatorReferral } from "@/lib/creator-referral.functions";

export const Route = createFileRoute("/r/$slug")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  component: ReferralLanding,
});
function ReferralLanding() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const result = await captureCreatorReferral({ data: { slug, landingPath: "/" } });
        if (result.ok && live) {
          try {
            localStorage.setItem(
              "lockhabit_creator_attribution",
              JSON.stringify({ token: result.token, expiresAt: result.expiresAt }),
            );
          } catch {
            // Private browsing or blocked storage must not strand a visitor on the referral route.
          }
          const w = window as Window & { dataLayer?: Array<Record<string, unknown>> };
          w.dataLayer = w.dataLayer || [];
          w.dataLayer.push({ event: "affiliate_visit" });
        }
      } catch {
        // A temporarily unavailable referral service must not block the storefront.
      } finally {
        if (live) void navigate({ to: "/", replace: true });
      }
    })();
    return () => {
      live = false;
    };
  }, [slug, navigate]);
  return (
    <main className="min-h-[50vh] grid place-items-center bg-background">
      <p className="memo">Taking you to LockHabit…</p>
    </main>
  );
}

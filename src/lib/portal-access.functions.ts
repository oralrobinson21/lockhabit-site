import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Route a signed-in account without exposing owner identity or creator records. */
export const resolvePortalAccess = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) =>
    z.object({ accessToken: z.string().min(20).max(5000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
      import("@/lib/order-admin.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    try {
      await requireOrderAdmin(data.accessToken);
      return { destination: "owner" as const };
    } catch {
      // A creator is never granted owner access by a matching client-side email.
    }
    const { data: auth, error } = await supabaseAdmin.auth.getUser(data.accessToken);
    if (error || !auth.user?.id || !auth.user.email_confirmed_at)
      return { destination: "none" as const };
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("creator_profiles")
      .select("status")
      .eq("auth_user_id", auth.user.id)
      .in("status", ["approved", "active"])
      .maybeSingle();
    if (profileError) throw new Error("Sign-in could not be verified. Please try again.");
    return { destination: profile ? "creator" as const : "none" as const };
  });

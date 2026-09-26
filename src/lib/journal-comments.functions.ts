import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);
const token = z.string().min(20).max(5000);
const uuid = z.string().uuid();

// Stays off while the Journal is a private preview. Publishing articles alone
// must never silently turn public comments on.
function commentsEnabled() {
  return process.env["LOCKHABIT_JOURNAL_COMMENTS_ENABLED"] === "true";
}

export const getApprovedJournalComments = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => z.object({ slug }).parse(data))
  .handler(async ({ data }) => {
    if (!commentsEnabled()) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post } = await supabaseAdmin
      .from("journal_posts")
      .select("id")
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (!post) return [];
    const { data: comments, error } = await supabaseAdmin
      .from("journal_comments")
      .select("id,author_name,body,created_at")
      .eq("post_id", post.id)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw new Error("Comments are temporarily unavailable.");
    return comments ?? [];
  });

export const submitJournalComment = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; slug: string; name: string; body: string }) =>
    z
      .object({
        accessToken: token,
        slug,
        name: z.string().trim().min(1).max(80),
        body: z.string().trim().min(10).max(3000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!commentsEnabled()) throw new Error("Journal comments are not open yet.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: auth, error: authError } = await supabaseAdmin.auth.getUser(data.accessToken);
    if (authError || !auth.user?.id || !auth.user.email_confirmed_at) {
      throw new Error("A confirmed account is required to comment.");
    }

    // Account separation: creators/owners may comment as people, but reader tools stay separate.
    const { data: post } = await supabaseAdmin
      .from("journal_posts")
      .select("id")
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (!post) throw new Error("This article is not open for comments.");

    const { data: recent, error: rateError } = await supabaseAdmin
      .from("journal_comments")
      .select("id")
      .eq("post_id", post.id)
      .eq("author_user_id", auth.user.id)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString())
      .limit(1);
    if (rateError || recent?.length) throw new Error("Please wait before sending another comment.");

    const { error } = await supabaseAdmin.from("journal_comments").insert({
      post_id: post.id,
      author_user_id: auth.user.id,
      author_name: data.name,
      body: data.body,
      status: "pending",
    });
    if (error) throw new Error("Comment could not be saved.");
    return { ok: true as const, notice: "Thanks! Your comment is awaiting review." };
  });

export const getOwnerJournalComments = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => z.object({ accessToken: token }).parse(data))
  .handler(async ({ data }) => {
    const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
      import("@/lib/order-admin.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    await requireOrderAdmin(data.accessToken);
    const { data: comments, error } = await supabaseAdmin
      .from("journal_comments")
      .select("id,post_id,author_name,body,status,created_at,moderated_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Journal comments could not be loaded.");
    return comments ?? [];
  });

export const moderateOwnerJournalComment = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; commentId: string; status: "approved" | "rejected" }) =>
    z
      .object({
        accessToken: token,
        commentId: uuid,
        status: z.enum(["approved", "rejected"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
      import("@/lib/order-admin.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    await requireOrderAdmin(data.accessToken);
    const { data: comment, error } = await supabaseAdmin
      .from("journal_comments")
      .update({ status: data.status, moderated_at: new Date().toISOString() })
      .eq("id", data.commentId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error || !comment) throw new Error("Comment is no longer pending.");
    return { ok: true as const };
  });

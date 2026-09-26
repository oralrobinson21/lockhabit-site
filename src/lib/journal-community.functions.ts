import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.string().min(20).max(5000);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160);
const speedSchema = z.union([z.literal(1), z.literal(1.5), z.literal(2)]);
const frequencySchema = z.enum(["daily_digest", "important_only", "weekly", "off"]);
const reactionSchema = z.enum(["like", "helpful", "made_me_laugh"]);

type PlatformSettings = {
  commentsEnabled: boolean;
  supporterEnabled: boolean;
  digestSendingEnabled: boolean;
  reactionsEnabled: boolean;
  authorFollowsEnabled: boolean;
  accountSignupEnabled: boolean;
};

const defaultSettings: PlatformSettings = {
  commentsEnabled: false,
  supporterEnabled: false,
  digestSendingEnabled: false,
  reactionsEnabled: true,
  authorFollowsEnabled: true,
  accountSignupEnabled: true,
};

async function authenticated(accessToken: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user?.id || !data.user.email) throw new Error("Please sign in again.");
  return { db: supabaseAdmin as any, user: data.user };
}

async function loadSettings(db: any): Promise<PlatformSettings> {
  try {
    const { data, error } = await db
      .from("journal_platform_settings")
      .select("comments_enabled,supporter_enabled,digest_sending_enabled,reactions_enabled,author_follows_enabled,account_signup_enabled")
      .eq("id", "default")
      .maybeSingle();
    if (error || !data) return defaultSettings;
    return {
      commentsEnabled: Boolean(data.comments_enabled),
      supporterEnabled: Boolean(data.supporter_enabled),
      digestSendingEnabled: Boolean(data.digest_sending_enabled),
      reactionsEnabled: data.reactions_enabled !== false,
      authorFollowsEnabled: data.author_follows_enabled !== false,
      accountSignupEnabled: data.account_signup_enabled !== false,
    };
  } catch {
    return defaultSettings;
  }
}

async function postBySlug(db: any, slug: string) {
  const rich = await db
    .from("journal_posts")
    .select("id,comments_allowed,audio_enabled,author_slug")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!rich.error && rich.data) return rich.data;
  const fallback = await db
    .from("journal_posts")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (fallback.error || !fallback.data) return null;
  return { ...fallback.data, comments_allowed: false, audio_enabled: true, author_slug: null };
}

export const ensureJournalMember = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) =>
    z.object({ accessToken: tokenSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const settings = await loadSettings(db);
    if (!settings.accountSignupEnabled) throw new Error("Reader accounts are temporarily paused.");

    const email = user.email!.trim().toLowerCase();
    const existing = await db
      .from("journal_members")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existing.error && !String(existing.error.message || "").toLowerCase().includes("does not exist")) {
      throw new Error("Your reader profile could not be loaded.");
    }

    if (!existing.data) {
      const inserted = await db
        .from("journal_members")
        .insert({
          auth_user_id: user.id,
          email,
          lifetime_discount_percent: 10,
          newsletter_frequency: "daily_digest",
          read_speed: 1,
          comments_opt_in: true,
          supporter_tier: "free",
          supporter_status: "none",
        })
        .select("*")
        .single();
      if (inserted.error) {
        throw new Error("Reader accounts are built, but the community database migration still needs to be applied.");
      }
    }

    await db
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          auth_user_id: user.id,
          source: "journal-account",
          frequency: "daily_digest",
          active: true,
        },
        { onConflict: "email" },
      );

    const member = await db
      .from("journal_members")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();
    if (member.error) throw new Error("Your reader profile could not be loaded.");
    return { member: member.data, settings };
  });

export const getJournalAccount = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) =>
    z.object({ accessToken: tokenSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const settings = await loadSettings(db);
    const { data: member } = await db
      .from("journal_members")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    return { member: member ?? null, settings, email: user.email ?? "" };
  });

export const saveJournalPreferences = createServerFn({ method: "POST" })
  .validator((data: {
    accessToken: string;
    displayName?: string;
    frequency: "daily_digest" | "important_only" | "weekly" | "off";
    categories: string[];
    readSpeed: 1 | 1.5 | 2;
    commentsOptIn: boolean;
  }) =>
    z
      .object({
        accessToken: tokenSchema,
        displayName: z.string().trim().max(60).optional(),
        frequency: frequencySchema,
        categories: z.array(z.string().trim().min(1).max(80)).max(20),
        readSpeed: speedSchema,
        commentsOptIn: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const email = user.email!.trim().toLowerCase();
    const values = {
      email,
      display_name: data.displayName?.trim() || null,
      newsletter_frequency: data.frequency,
      newsletter_categories: data.categories,
      read_speed: data.readSpeed,
      comments_opt_in: data.commentsOptIn,
      updated_at: new Date().toISOString(),
    };
    const { error } = await db
      .from("journal_members")
      .upsert({ auth_user_id: user.id, ...values }, { onConflict: "auth_user_id" });
    if (error) throw new Error("Your preferences could not be saved.");

    const { error: newsletterError } = await db
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          auth_user_id: user.id,
          source: "journal-account",
          frequency: data.frequency,
          categories: data.categories,
          active: data.frequency !== "off",
        },
        { onConflict: "email" },
      );
    if (newsletterError) throw new Error("Your newsletter preferences could not be saved.");
    return { ok: true as const };
  });

export const getJournalEngagement = createServerFn({ method: "POST" })
  .validator((data: { slug: string; accessToken?: string }) =>
    z.object({ slug: slugSchema, accessToken: tokenSchema.optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const settings = await loadSettings(db);
    const post = await postBySlug(db, data.slug);
    if (!post) return { found: false as const, settings };

    let userId: string | null = null;
    if (data.accessToken) {
      const result = await supabaseAdmin.auth.getUser(data.accessToken);
      userId = result.data.user?.id ?? null;
    }

    const counts = { like: 0, helpful: 0, made_me_laugh: 0 };
    let userReactions: string[] = [];
    let bookmarked = false;
    let comments: Array<{ id: string; body: string; displayName: string; createdAt: string; parentCommentId: string | null }> = [];

    if (settings.reactionsEnabled) {
      try {
        const { data: reactions } = await db
          .from("journal_reactions")
          .select("reaction,auth_user_id")
          .eq("post_id", post.id);
        for (const row of reactions ?? []) {
          if (row.reaction in counts) counts[row.reaction as keyof typeof counts] += 1;
          if (userId && row.auth_user_id === userId) userReactions.push(row.reaction);
        }
      } catch {
        // Community tables may not be migrated yet on a preview.
      }
    }

    if (userId) {
      try {
        const { data: bookmark } = await db
          .from("journal_bookmarks")
          .select("post_id")
          .eq("post_id", post.id)
          .eq("auth_user_id", userId)
          .maybeSingle();
        bookmarked = Boolean(bookmark);
      } catch {
        bookmarked = false;
      }
    }

    if (settings.commentsEnabled && post.comments_allowed) {
      try {
        const { data: rows } = await db
          .from("journal_comments")
          .select("id,body,display_name_snapshot,created_at,parent_comment_id")
          .eq("post_id", post.id)
          .eq("status", "approved")
          .order("created_at", { ascending: true })
          .limit(200);
        comments = (rows ?? []).map((row: any) => ({
          id: row.id,
          body: row.body,
          displayName: row.display_name_snapshot,
          createdAt: row.created_at,
          parentCommentId: row.parent_comment_id ?? null,
        }));
      } catch {
        comments = [];
      }
    }

    return {
      found: true as const,
      settings,
      commentsAllowed: Boolean(post.comments_allowed),
      audioEnabled: post.audio_enabled !== false,
      counts,
      userReactions,
      bookmarked,
      comments,
      signedIn: Boolean(userId),
    };
  });

export const toggleJournalReaction = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; slug: string; reaction: "like" | "helpful" | "made_me_laugh" }) =>
    z.object({ accessToken: tokenSchema, slug: slugSchema, reaction: reactionSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const settings = await loadSettings(db);
    if (!settings.reactionsEnabled) throw new Error("Reactions are temporarily paused.");
    const post = await postBySlug(db, data.slug);
    if (!post) throw new Error("Story not found.");

    const existing = await db
      .from("journal_reactions")
      .select("reaction")
      .eq("post_id", post.id)
      .eq("auth_user_id", user.id)
      .eq("reaction", data.reaction)
      .maybeSingle();

    if (existing.data) {
      const { error } = await db
        .from("journal_reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("auth_user_id", user.id)
        .eq("reaction", data.reaction);
      if (error) throw new Error("Reaction could not be updated.");
      return { active: false as const };
    }

    const { error } = await db.from("journal_reactions").insert({
      post_id: post.id,
      auth_user_id: user.id,
      reaction: data.reaction,
    });
    if (error) throw new Error("Reaction could not be updated.");
    return { active: true as const };
  });

export const toggleJournalBookmark = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; slug: string }) =>
    z.object({ accessToken: tokenSchema, slug: slugSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const post = await postBySlug(db, data.slug);
    if (!post) throw new Error("Story not found.");
    const existing = await db
      .from("journal_bookmarks")
      .select("post_id")
      .eq("post_id", post.id)
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (existing.data) {
      const { error } = await db
        .from("journal_bookmarks")
        .delete()
        .eq("post_id", post.id)
        .eq("auth_user_id", user.id);
      if (error) throw new Error("Saved story could not be updated.");
      return { saved: false as const };
    }
    const { error } = await db.from("journal_bookmarks").insert({
      post_id: post.id,
      auth_user_id: user.id,
    });
    if (error) throw new Error("Saved story could not be updated.");
    return { saved: true as const };
  });

export const submitJournalComment = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; slug: string; body: string; parentCommentId?: string }) =>
    z
      .object({
        accessToken: tokenSchema,
        slug: slugSchema,
        body: z.string().trim().min(1).max(4000),
        parentCommentId: z.string().uuid().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const settings = await loadSettings(db);
    if (!settings.commentsEnabled) throw new Error("Comments are not open yet.");
    const post = await postBySlug(db, data.slug);
    if (!post || !post.comments_allowed) throw new Error("Comments are closed on this story.");

    const { data: member } = await db
      .from("journal_members")
      .select("display_name,comments_opt_in")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (!member?.comments_opt_in) throw new Error("Turn on comment participation in your reader settings first.");

    const displayName = member.display_name?.trim() || "Resort Guest";
    const { error } = await db.from("journal_comments").insert({
      post_id: post.id,
      auth_user_id: user.id,
      parent_comment_id: data.parentCommentId ?? null,
      display_name_snapshot: displayName,
      body: data.body.trim(),
      status: "pending",
    });
    if (error) throw new Error("Your comment could not be sent.");
    return { ok: true as const, status: "pending" as const };
  });

export const recordJournalShare = createServerFn({ method: "POST" })
  .validator((data: { slug: string; channel: "native" | "copy_link" | "email" | "text" | "other"; accessToken?: string }) =>
    z
      .object({
        slug: slugSchema,
        channel: z.enum(["native", "copy_link", "email", "text", "other"]),
        accessToken: tokenSchema.optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const post = await postBySlug(db, data.slug);
    if (!post) return { ok: false as const };
    let userId: string | null = null;
    if (data.accessToken) {
      const auth = await supabaseAdmin.auth.getUser(data.accessToken);
      userId = auth.data.user?.id ?? null;
    }
    try {
      await db.from("journal_share_events").insert({
        post_id: post.id,
        auth_user_id: userId,
        channel: data.channel,
      });
    } catch {
      // Analytics must never block sharing.
    }
    return { ok: true as const };
  });

export const createJournalSupportCheckout = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; amountCents: 300 | 500; returnUrl: string }) =>
    z
      .object({
        accessToken: tokenSchema,
        amountCents: z.union([z.literal(300), z.literal(500)]),
        returnUrl: z.string().url().max(1000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { db, user } = await authenticated(data.accessToken);
    const settings = await loadSettings(db);
    if (!settings.supporterEnabled) throw new Error("Supporter checkout is built but not open yet.");

    const [{ createStripeClient, getStripeEnvironment }, { URL }] = await Promise.all([
      import("@/lib/stripe.server"),
      Promise.resolve({ URL: globalThis.URL }),
    ]);
    const returnUrl = new URL(data.returnUrl);
    const allowed =
      returnUrl.hostname === "lockhabit.com" ||
      returnUrl.hostname === "www.lockhabit.com" ||
      returnUrl.hostname.endsWith(".vercel.app") ||
      returnUrl.hostname.endsWith(".lovable.app") ||
      returnUrl.hostname === "localhost";
    if (!allowed) throw new Error("Unsupported return address.");

    const environment = getStripeEnvironment();
    const stripe = createStripeClient(environment);
    const { data: member } = await db
      .from("journal_members")
      .select("stripe_customer_id,email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    let customerId = member?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { lockhabit_journal_user_id: user.id },
      });
      customerId = customer.id;
      const { error } = await db
        .from("journal_members")
        .upsert(
          {
            auth_user_id: user.id,
            email: (user.email ?? "").toLowerCase(),
            stripe_customer_id: customerId,
          },
          { onConflict: "auth_user_id" },
        );
      if (error) throw new Error("Supporter profile could not be prepared.");
    }

    const tier = data.amountCents === 300 ? "supporter_3" : "supporter_5";
    const success = new URL("/journal/account?support=thanks&session_id={CHECKOUT_SESSION_ID}", returnUrl.origin).toString();
    const cancel = new URL("/journal/account?support=cancelled", returnUrl.origin).toString();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: data.amountCents,
            recurring: { interval: "month" },
            product_data: {
              name: data.amountCents === 300 ? "LOCKHABIT Journal Supporter — $3" : "LOCKHABIT Journal Supporter — $5",
              description: "Optional support for free LOCKHABIT editorial. No paywall required.",
            },
          },
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: {
        journal_supporter: "true",
        auth_user_id: user.id,
        support_tier: tier,
        amount_cents: String(data.amountCents),
      },
      subscription_data: {
        metadata: {
          journal_supporter: "true",
          auth_user_id: user.id,
          support_tier: tier,
          amount_cents: String(data.amountCents),
        },
      },
    });
    return { url: session.url ?? "" };
  });

export const getOwnerJournalCommunity = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) =>
    z.object({ accessToken: tokenSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
      import("@/lib/order-admin.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    await requireOrderAdmin(data.accessToken);
    const db = supabaseAdmin as any;
    const settings = await loadSettings(db);

    const [comments, memberCount, supporters] = await Promise.all([
      db
        .from("journal_comments")
        .select("id,post_id,auth_user_id,display_name_snapshot,body,status,created_at,moderation_reason")
        .order("created_at", { ascending: false })
        .limit(200),
      db.from("journal_members").select("auth_user_id", { count: "exact", head: true }),
      db
        .from("journal_members")
        .select("auth_user_id", { count: "exact", head: true })
        .eq("supporter_status", "active"),
    ]);

    return {
      settings,
      comments: comments.data ?? [],
      memberCount: memberCount.count ?? 0,
      supporterCount: supporters.count ?? 0,
    };
  });

export const setOwnerJournalSettings = createServerFn({ method: "POST" })
  .validator((data: {
    accessToken: string;
    commentsEnabled: boolean;
    supporterEnabled: boolean;
    digestSendingEnabled: boolean;
    reactionsEnabled: boolean;
    authorFollowsEnabled: boolean;
    accountSignupEnabled: boolean;
  }) =>
    z
      .object({
        accessToken: tokenSchema,
        commentsEnabled: z.boolean(),
        supporterEnabled: z.boolean(),
        digestSendingEnabled: z.boolean(),
        reactionsEnabled: z.boolean(),
        authorFollowsEnabled: z.boolean(),
        accountSignupEnabled: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
      import("@/lib/order-admin.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    await requireOrderAdmin(data.accessToken);
    const db = supabaseAdmin as any;
    const { error } = await db
      .from("journal_platform_settings")
      .upsert(
        {
          id: "default",
          comments_enabled: data.commentsEnabled,
          supporter_enabled: data.supporterEnabled,
          digest_sending_enabled: data.digestSendingEnabled,
          reactions_enabled: data.reactionsEnabled,
          author_follows_enabled: data.authorFollowsEnabled,
          account_signup_enabled: data.accountSignupEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    if (error) throw new Error("Journal settings could not be saved.");
    return { ok: true as const };
  });

export const moderateJournalComment = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; commentId: string; status: "approved" | "hidden" | "spam"; reason?: string }) =>
    z
      .object({
        accessToken: tokenSchema,
        commentId: z.string().uuid(),
        status: z.enum(["approved", "hidden", "spam"]),
        reason: z.string().trim().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
      import("@/lib/order-admin.server"),
      import("@/integrations/supabase/client.server"),
    ]);
    await requireOrderAdmin(data.accessToken);
    const db = supabaseAdmin as any;
    const { error } = await db
      .from("journal_comments")
      .update({
        status: data.status,
        moderation_reason: data.reason?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.commentId);
    if (error) throw new Error("Comment moderation could not be saved.");
    return { ok: true as const };
  });

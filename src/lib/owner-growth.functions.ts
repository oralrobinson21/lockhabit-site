import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const token = z.string().min(20).max(5000);
const uuid = z.string().uuid();

async function owner(accessToken: string) {
  const [{ requireOrderAdmin }, { supabaseAdmin }] = await Promise.all([
    import("@/lib/order-admin.server"),
    import("@/integrations/supabase/client.server"),
  ]);
  await requireOrderAdmin(accessToken);
  return supabaseAdmin;
}

export const getOwnerGrowth = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => z.object({ accessToken: token }).parse(data))
  .handler(async ({ data }) => {
    const db = await owner(data.accessToken);
    const [profiles, payouts, outreach, posts] = await Promise.all([
      db
        .from("creator_profiles")
        .select(
          "id,email,display_name,username,referral_code,referral_slug,status,commission_bps,tax_status,payout_status,agreement_accepted_at,disclosure_acknowledged_at,invited_at,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      db
        .from("creator_payout_requests")
        .select(
          "id,creator_id,amount_cents,currency,status,requested_at,reviewed_at,paid_at,owner_note",
        )
        .order("requested_at", { ascending: false })
        .limit(200),
      db.from("creator_outreach").select("*").order("created_at", { ascending: false }).limit(200),
      db
        .from("journal_posts")
        .select(
          "id,slug,title,excerpt,category,status,body,hero_image_url,hero_image_alt,reference_items,author,reviewed_at,reading_time_minutes,related_product_slugs,seo_title,seo_description,published_at,created_at,updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(200),
    ]);
    for (const result of [profiles, payouts, outreach, posts])
      if (result.error) throw new Error("Owner data could not be loaded.");
    return {
      creators: profiles.data ?? [],
      payouts: payouts.data ?? [],
      outreach: outreach.data ?? [],
      posts: posts.data ?? [],
    };
  });

export const saveOwnerCreator = createServerFn({ method: "POST" })
  .validator(
    (data: {
      accessToken: string;
      id?: string;
      email?: string;
      displayName?: string;
      slug?: string;
      code?: string;
      status: "applicant" | "approved" | "active" | "paused";
      commissionBps: number;
      taxStatus?: "not_required" | "requested" | "complete" | "blocked";
      payoutStatus?: "not_ready" | "ready" | "blocked";
    }) =>
      z
        .object({
          accessToken: token,
          id: uuid.optional(),
          email: z.string().email().max(254).optional(),
          displayName: z.string().trim().min(1).max(120).optional(),
          slug: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .max(80)
            .optional(),
          code: z
            .string()
            .regex(/^[A-Z0-9-]+$/)
            .max(40)
            .optional(),
          status: z.enum(["applicant", "approved", "active", "paused"]),
          commissionBps: z.number().int().min(0).max(10000),
          taxStatus: z.enum(["not_required", "requested", "complete", "blocked"]).optional(),
          payoutStatus: z.enum(["not_ready", "ready", "blocked"]).optional(),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await owner(data.accessToken);
    const values = {
      status: data.status,
      commission_bps: data.commissionBps,
      updated_at: new Date().toISOString(),
      ...(data.taxStatus ? { tax_status: data.taxStatus } : {}),
      ...(data.payoutStatus ? { payout_status: data.payoutStatus } : {}),
    };
    const result = data.id
      ? await db.from("creator_profiles").update(values).eq("id", data.id).select("id").single()
      : await db
          .from("creator_profiles")
          .insert({
            ...values,
            email: data.email!.trim().toLowerCase(),
            display_name: data.displayName!,
            referral_slug: data.slug!,
            referral_code: data.code!,
          })
          .select("id")
          .single();
    if (result.error) throw new Error(result.error.message);
    return { id: result.data.id };
  });

export const saveOwnerProspect = createServerFn({ method: "POST" })
  .validator(
    (data: {
      accessToken: string;
      id?: string;
      name: string;
      platform?: string;
      profileUrl?: string;
      contact?: string;
      niche?: string;
      notes?: string;
      creatorId?: string;
      stage: "prospect" | "contacted" | "responded" | "interested" | "approved" | "active";
    }) =>
      z
        .object({
          accessToken: token,
          id: uuid.optional(),
          name: z.string().trim().min(1).max(120),
          platform: z.string().max(100).optional(),
          profileUrl: z.union([z.literal(""), z.string().url().max(500)]).optional(),
          contact: z.string().max(254).optional(),
          niche: z.string().max(120).optional(),
          notes: z.string().max(3000).optional(),
          creatorId: uuid.optional(),
          stage: z.enum(["prospect", "contacted", "responded", "interested", "approved", "active"]),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await owner(data.accessToken);
    const values = {
      name_or_brand: data.name,
      platform: data.platform ?? null,
      profile_url: data.profileUrl || null,
      contact: data.contact ?? null,
      niche: data.niche ?? null,
      notes: data.notes ?? null,
      ...(data.creatorId ? { creator_id: data.creatorId } : {}),
      stage: data.stage,
      updated_at: new Date().toISOString(),
    };
    const result = data.id
      ? await db.from("creator_outreach").update(values).eq("id", data.id)
      : await db.from("creator_outreach").insert(values);
    if (result.error) throw new Error(result.error.message);
    return { ok: true as const };
  });

export const saveOwnerJournal = createServerFn({ method: "POST" })
  .validator(
    (data: {
      accessToken: string;
      id?: string;
      slug: string;
      title: string;
      excerpt: string;
      category: string;
      body: string;
      references: string;
      author: string;
      heroImageUrl: string;
      heroImageAlt: string;
      seoTitle: string;
      seoDescription: string;
      status: "draft" | "in_review" | "published";
    }) =>
      z
        .object({
          accessToken: token,
          id: uuid.optional(),
          slug: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .max(120),
          title: z.string().trim().min(3).max(220),
          excerpt: z.string().max(500),
          category: z.string().min(1).max(80),
          body: z.string().max(50000),
          references: z.string().max(12000),
          author: z.string().trim().min(1).max(120),
          heroImageUrl: z.union([z.literal(""), z.string().url().max(1000)]),
          heroImageAlt: z.string().max(240),
          seoTitle: z.string().max(220),
          seoDescription: z.string().max(500),
          status: z.enum(["draft", "in_review", "published"]),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await owner(data.accessToken);
    if (data.status === "published" && (!data.body.trim() || !data.references.trim()))
      throw new Error("A published article requires a body and references.");
    const values = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      category: data.category,
      author: data.author,
      hero_image_url: data.heroImageUrl || null,
      hero_image_alt: data.heroImageAlt || null,
      seo_title: data.seoTitle || null,
      seo_description: data.seoDescription || null,
      reading_time_minutes: Math.max(1, Math.ceil(data.body.trim().split(/\s+/).length / 220)),
      body: [{ type: "paragraph", text: data.body }],
      reference_items: data.references
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      status: data.status,
      published_at: data.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const result = data.id
      ? await db.from("journal_posts").update(values).eq("id", data.id)
      : await db.from("journal_posts").insert(values);
    if (result.error) throw new Error(result.error.message);
    return { ok: true as const };
  });

export const inviteOwnerCreator = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string; creatorId: string }) =>
    z.object({ accessToken: token, creatorId: uuid }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await owner(data.accessToken);
    const { data: creator, error } = await db
      .from("creator_profiles")
      .select("id,email,display_name,status,auth_user_id")
      .eq("id", data.creatorId)
      .single();
    if (error || !creator || !["approved", "active"].includes(creator.status))
      throw new Error("Approve the creator before sending an invite.");
    const key = process.env["RESEND_API_KEY"];
    const from = process.env["LOCKHABIT_ORDER_FROM_EMAIL"];
    if (!key || !from) throw new Error("Creator email is not configured.");
    // Supabase issues a short-lived one-time invite/recovery token. Never email a password.
    const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
      type: creator.auth_user_id ? "recovery" : "invite",
      email: creator.email,
      options: { redirectTo: "https://lockhabit.com/creator/set-password" },
    });
    if (linkError || !linkData?.properties?.action_link || !linkData.user?.id)
      throw new Error("Creator invite could not be created.");
    const { error: bindError } = await db
      .from("creator_profiles")
      .update({ auth_user_id: linkData.user.id })
      .eq("id", creator.id)
      .select("id")
      .single();
    if (bindError) throw new Error("Creator invite could not be linked.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [creator.email],
        subject: "Your LOCKHABIT creator access",
        text: `Welcome to the LOCKHABIT creator program. Choose a password using this one-time link:\n\n${linkData.properties.action_link}\n\nIf you weren't expecting this invitation, ignore it.`,
      }),
    });
    if (!response.ok)
      throw new Error("Creator invitation email could not be delivered. Please retry.");
    const { error: saved } = await db
      .from("creator_profiles")
      .update({ invited_at: new Date().toISOString() })
      .eq("id", creator.id);
    if (saved) throw new Error("Creator invitation sent, but its timestamp could not be saved.");
    return { ok: true as const };
  });

export const transitionOwnerPayout = createServerFn({ method: "POST" })
  .validator(
    (data: {
      accessToken: string;
      payoutId: string;
      action: "approve" | "reject" | "paid";
      note: string;
    }) =>
      z
        .object({
          accessToken: token,
          payoutId: uuid,
          action: z.enum(["approve", "reject", "paid"]),
          note: z.string().max(500),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await owner(data.accessToken);
    const { error } = await db.rpc("owner_transition_creator_payout", {
      p_request_id: data.payoutId,
      p_action: data.action,
      p_note: data.note,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

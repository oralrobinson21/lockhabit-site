export type JournalBlock =
  | { type: "heading" | "paragraph"; text: string }
  | { type: "own_product"; slug: string; note: string }
  | { type: "affiliate"; label: string; url: string; note: string };

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !!url.hostname && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function parseJournalBlocks(body: string, recommendations: string): JournalBlock[] {
  const blocks: JournalBlock[] = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part): JournalBlock =>
      part.startsWith("## ")
        ? { type: "heading", text: part.slice(3).trim() }
        : { type: "paragraph", text: part },
    );

  for (const line of recommendations.split("\n").map((part) => part.trim()).filter(Boolean)) {
    const pieces = line.split("|").map((part) => part.trim());
    if (pieces.length !== 4) throw new Error("Each recommendation needs type | label | link or slug | note.");
    const [kind, label, destination, note] = pieces as [string, string, string, string];
    if (!label || !note || label.length > 120 || note.length > 500)
      throw new Error("Every recommendation needs a short label and honest note.");
    if (kind === "own") {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(destination))
        throw new Error("Choose a valid LockHabit product slug.");
      blocks.push({ type: "own_product", slug: destination, note });
    } else if (kind === "affiliate") {
      if (!isSafeExternalUrl(destination) || /(^|\.)lockhabit\.com$/.test(new URL(destination).hostname))
        throw new Error("Outside recommendations require a secure external URL.");
      blocks.push({ type: "affiliate", label, url: destination, note });
    } else {
      throw new Error("Recommendation type must be own or affiliate.");
    }
  }
  return blocks;
}

export function publishedJournalBlocks(value: unknown): JournalBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((block): JournalBlock[] => {
    if (!block || typeof block !== "object") return [];
    if ((block.type === "heading" || block.type === "paragraph") && typeof block.text === "string")
      return [{ type: block.type, text: block.text.slice(0, 50000) }];
    if (block.type === "own_product" && typeof block.slug === "string" && typeof block.note === "string")
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(block.slug)
        ? [{ type: "own_product", slug: block.slug, note: block.note.slice(0, 500) }]
        : [];
    if (block.type === "affiliate" && typeof block.label === "string" && typeof block.note === "string" && typeof block.url === "string" && isSafeExternalUrl(block.url))
      return [{ type: "affiliate", label: block.label.slice(0, 120), url: block.url, note: block.note.slice(0, 500) }];
    return [];
  });
}

export function editableJournalBody(value: unknown): string {
  return publishedJournalBlocks(value)
    .filter((block) => block.type === "heading" || block.type === "paragraph")
    .map((block) => block.type === "heading" ? `## ${block.text}` : block.type === "paragraph" ? block.text : "")
    .join("\n\n");
}

export function editableJournalRecommendations(value: unknown): string {
  return publishedJournalBlocks(value)
    .filter((block) => block.type === "own_product" || block.type === "affiliate")
    .map((block) => block.type === "own_product"
      ? `own | LockHabit product | ${block.slug} | ${block.note}`
      : `affiliate | ${block.label} | ${block.url} | ${block.note}`)
    .join("\n");
}

export function validatedJournalReferences(value: string): string[] {
  const references = value.split("\n").map((item) => item.trim()).filter(Boolean);
  if (references.length > 30 || references.some((reference) => !isSafeExternalUrl(reference)))
    throw new Error("References must be secure, direct https:// source URLs (one per line, max 30).");
  return references;
}

export function validateJournalForPublication(body: string, references: string[], heroUrl: string, heroAlt: string): void {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 250 || references.length < 2)
    throw new Error("Publication needs at least 250 words and two direct source URLs. Save a draft while researching.");
  if (heroUrl && !heroAlt.trim())
    throw new Error("Add descriptive alt text for the article image before publishing.");
}

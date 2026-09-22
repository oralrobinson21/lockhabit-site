import { createFileRoute } from "@tanstack/react-router";

import { isInkStyle, renderInkPng, verifyInkPayload, type InkStyle } from "@/lib/email-ink.server";

/**
 * Signed PNG renderer for dynamic receipt ink (line items, totals, dates).
 * Outlook iOS dark mode cannot recolor images, so these stay dark brown on cream.
 *
 * Safety: HMAC signature required; style whitelist; short text only; no secrets in response.
 */
export const Route = createFileRoute("/api/email-ink")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const styleParam = url.searchParams.get("style") ?? "";
        const text = url.searchParams.get("text") ?? "";
        const sig = url.searchParams.get("sig") ?? "";

        if (!isInkStyle(styleParam)) {
          return new Response("Not found", { status: 404 });
        }
        const style = styleParam as InkStyle;
        if (!text || text.length > 240) {
          return new Response("Not found", { status: 404 });
        }
        if (!verifyInkPayload(style, text, sig)) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const png = await renderInkPng(style, text);
          return new Response(new Uint8Array(png), {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Robots-Tag": "noindex",
            },
          });
        } catch (error) {
          console.error(
            "[email-ink] render failed:",
            error instanceof Error ? error.message : "unknown error",
          );
          return new Response("Ink render failed", { status: 500 });
        }
      },
    },
  },
});

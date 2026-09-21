# LOCKHABIT, the Vacation.inc way

Rebuild the storefront in the spirit of Vacation.inc: a 1980s leisure-brand world instead of a plain shop. Same twelve soaps, same real logo, same bright tropical warmth — but presented as a fictional sun-care company with a catalog, a lobby, and a lot of personality.

## The look

- Palette: saturated sun yellow, pool aqua, coral, cream paper. Bright and retro, not pastel-bland.
- Type: a bold retro display face for headlines paired with a clean grotesque for body copy, plus small-caps "corporate memo" labels.
- Paper grain overlay, thin rules, and vintage catalog framing so the page feels printed rather than digital.
- Sticker badges ("EST. 1986", "SPF OF THE SOUL", "SUN TESTED") rotated slightly and scattered with intent.
- Motion stays gentle: slow marquees, soft rise-in on scroll, sticker wobble on hover, image cross-fades. All disabled when the visitor prefers reduced motion.

## The page, top to bottom

1. **Lobby bar** — thin ticker across the very top with the date, a fake temperature, and "Now open".
2. **Header** — real LOCKHABIT logo, retro nav, bag button with count.
3. **Hero** — oversized headline, sun-yellow field, hero photo in a rounded retro frame, sticker badges, "Shop the collection".
4. **Marquee strip** — scrolling brand slogan band.
5. **The Concierge Desk** — three playful service cards (Daily Ritual, Scent Matching, Gift Notes) in the voice of a resort front desk.
6. **Featured soap** — the existing Coconut Beach four-image gallery, restyled as a catalog spread with thumbnails, details, and add-to-bag.
7. **The full catalog** — all twelve soaps as numbered catalog entries on cream paper cards with retro price tags, hover lift, and add-to-bag.
8. **Ingredients** — "What's inside the bottle of sunshine", icon row.
9. **Our story** — brand narrative panel with photo and a signed "memo from management".
10. **Postcard signup** — a fun (non-functional, clearly demo) "send me a postcard" email field.
11. **Footer** — credits-style, retro columns, logo, small print.

The bag stays as it is today: slide-in drawer, quantities, subtotal, demo checkout notice.

## Technical notes

- Single route `src/routes/index.tsx` rewritten; all colors, gradients, grain, and shadows added as tokens and utilities in `src/styles.css` (no hardcoded color classes).
- New retro font pair loaded via `<link>` in `src/routes/__root.tsx`; `@theme` gets matching `--font-*` tokens.
- Existing assets reused: real logo pointer, hero photo, twelve product images, three Coconut Beach gallery shots. A small number of new decorative images (sticker/texture/story photo) generated if needed.
- Scroll-in animation via a small intersection-observer hook; keyframes in `styles.css` behind a `prefers-reduced-motion` kill switch.
- Route `head()` metadata updated to match the new positioning.
- Verified with Playwright at desktop 1280 and mobile 440: twelve products present, gallery thumbnails switch, bag adds and totals, no console errors, no horizontal overflow.

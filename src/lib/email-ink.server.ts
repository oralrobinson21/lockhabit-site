import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

/**
 * Rasterize receipt “ink” copy to PNG so Outlook iOS / Apple Mail dark-mode
 * invert cannot wash dark brown text into pale pink on cream paper.
 *
 * Static slices live under /email/receipt/ink-*.png.
 * Dynamic values (totals, line items, dates) are signed URLs to /api/email-ink.
 */

const FONT_FILES = {
  sansRegular: "LiberationSans-Regular.ttf",
  sansBold: "LiberationSans-Bold.ttf",
  serifBold: "LiberationSerif-Bold.ttf",
} as const;

const resolveFontsDir = () => {
  const candidates = [
    join(process.cwd(), "public/email/receipt/fonts"),
    join(process.cwd(), ".output/public/email/receipt/fonts"),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, FONT_FILES.sansRegular))) return dir;
  }
  throw new Error("LockHabit email ink fonts are missing from the deploy");
};

let cachedFontFaceCss: string | null = null;
const fontFaceCss = () => {
  if (cachedFontFaceCss) return cachedFontFaceCss;
  const dir = resolveFontsDir();
  const fileUrl = (file: string) => `file://${join(dir, file)}`;
  cachedFontFaceCss = `
@font-face {
  font-family: "InkSans";
  src: url("${fileUrl(FONT_FILES.sansRegular)}") format("truetype");
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: "InkSans";
  src: url("${fileUrl(FONT_FILES.sansBold)}") format("truetype");
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: "InkSerif";
  src: url("${fileUrl(FONT_FILES.serifBold)}") format("truetype");
  font-weight: 700;
  font-style: normal;
}
`;
  return cachedFontFaceCss;
};

export const INK = {
  brown: "#2d0802",
  teal: "#0c5c5f",
  cream: "#fff3db",
  table: "#fbf3e2",
  thead: "#f1e2c6",
  sand: "#fde7b6",
} as const;

export type InkStyle =
  | "stat-num"
  | "stat-amt"
  | "stat-date"
  | "kind"
  | "cell"
  | "cell-right"
  | "total-value"
  | "ship"
  | "support";

type StyleSpec = {
  fontSize: number;
  fontWeight: number;
  fontFamily: "serif" | "sans";
  color: string;
  background: string;
  align: "left" | "right" | "center";
  letterSpacing?: number;
  lineHeight: number;
  padX: number;
  padY: number;
  maxWidth?: number;
};

const STYLES: Record<InkStyle, StyleSpec> = {
  "stat-num": {
    fontSize: 19,
    fontWeight: 500,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.cream,
    align: "left",
    lineHeight: 24,
    padX: 0,
    padY: 2,
  },
  "stat-amt": {
    fontSize: 26,
    fontWeight: 700,
    fontFamily: "serif",
    color: INK.brown,
    background: INK.cream,
    align: "left",
    lineHeight: 28,
    padX: 0,
    padY: 2,
  },
  "stat-date": {
    fontSize: 18,
    fontWeight: 500,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.cream,
    align: "left",
    lineHeight: 23,
    padX: 0,
    padY: 2,
    maxWidth: 180,
  },
  kind: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.cream,
    align: "left",
    letterSpacing: 4,
    lineHeight: 18,
    padX: 0,
    padY: 2,
  },
  cell: {
    fontSize: 15,
    fontWeight: 400,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.table,
    align: "left",
    lineHeight: 22,
    padX: 0,
    padY: 2,
    maxWidth: 340,
  },
  "cell-right": {
    fontSize: 15,
    fontWeight: 400,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.table,
    align: "right",
    lineHeight: 22,
    padX: 0,
    padY: 2,
    maxWidth: 160,
  },
  "total-value": {
    fontSize: 30,
    fontWeight: 700,
    fontFamily: "sans",
    color: INK.teal,
    background: INK.table,
    align: "right",
    lineHeight: 32,
    padX: 0,
    padY: 2,
  },
  ship: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.cream,
    align: "left",
    lineHeight: 18,
    padX: 0,
    padY: 2,
    maxWidth: 520,
  },
  support: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: "sans",
    color: INK.brown,
    background: INK.sand,
    align: "center",
    lineHeight: 18,
    padX: 8,
    padY: 2,
    maxWidth: 420,
  },
};

const FALLBACK_INK_SECRET = "tropical-receipt-proof-7c1e9b";
const MAX_TEXT_CHARS = 240;

const inkSecret = () =>
  process.env["LOCKHABIT_EMAIL_INK_SECRET"] ??
  process.env["LOCKHABIT_EMAIL_TEST_TOKEN"] ??
  FALLBACK_INK_SECRET;

export const isInkStyle = (value: string): value is InkStyle =>
  Object.prototype.hasOwnProperty.call(STYLES, value);

export function signInkPayload(style: InkStyle, text: string): string {
  return createHmac("sha256", inkSecret()).update(`${style}\0${text}`).digest("hex").slice(0, 24);
}

export function verifyInkPayload(style: InkStyle, text: string, sig: string): boolean {
  if (!sig || sig.length > 64) return false;
  const expected = signInkPayload(style, text);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fontStack = (family: StyleSpec["fontFamily"], weight: number) => {
  if (family === "serif") return "InkSerif, Georgia, serif";
  // Medium weights fall back to regular InkSans face.
  return weight >= 600 ? "InkSans, Arial, sans-serif" : "InkSans, Arial, sans-serif";
};

const wrapLines = (text: string, maxChars: number): string[] => {
  const explicit = text.split(/\n/);
  const lines: string[] = [];
  for (const block of explicit) {
    if (!block) {
      lines.push("");
      continue;
    }
    if (block.length <= maxChars) {
      lines.push(block);
      continue;
    }
    const words = block.split(/\s+/);
    let cur = "";
    for (const word of words) {
      const trial = cur ? `${cur} ${word}` : word;
      if (trial.length <= maxChars) {
        cur = trial;
      } else {
        if (cur) lines.push(cur);
        cur = word.length > maxChars ? word.slice(0, maxChars) : word;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines.length ? lines : [""];
};

/** Approximate average glyph width as a fraction of font-size (sans ~0.55). */
const avgGlyph = (family: StyleSpec["fontFamily"], tracking: number) =>
  (family === "serif" ? 0.52 : 0.56) + tracking / 16;

export async function renderInkPng(style: InkStyle, rawText: string): Promise<Buffer> {
  const text = rawText.replace(/\r/g, "").slice(0, MAX_TEXT_CHARS);
  const spec = STYLES[style];
  const tracking = spec.letterSpacing ?? 0;
  const maxChars = spec.maxWidth
    ? Math.max(8, Math.floor(spec.maxWidth / (spec.fontSize * avgGlyph(spec.fontFamily, tracking))))
    : 80;
  const lines = wrapLines(text, maxChars).slice(0, 6);

  const widest = Math.max(
    ...lines.map((line) => {
      const glyphs = [...line];
      return (
        glyphs.length * spec.fontSize * avgGlyph(spec.fontFamily, tracking) +
        tracking * Math.max(0, glyphs.length - 1)
      );
    }),
    8,
  );
  const width = Math.ceil(Math.min(640, Math.max(widest + spec.padX * 2, 24)));
  const height = Math.ceil(lines.length * spec.lineHeight + spec.padY * 2);

  const textAnchor = spec.align === "right" ? "end" : spec.align === "center" ? "middle" : "start";
  const x =
    spec.align === "right" ? width - spec.padX : spec.align === "center" ? width / 2 : spec.padX;

  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : spec.lineHeight;
      const spacing = tracking > 0 ? ` letter-spacing="${tracking}"` : "";
      return `<tspan x="${x}" dy="${dy}"${spacing}>${escapeXml(line)}</tspan>`;
    })
    .join("");

  // Baseline roughly at 0.78 of line box so glyphs sit inside the row.
  const firstBaseline = spec.padY + Math.round(spec.lineHeight * 0.78);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><style type="text/css"><![CDATA[${fontFaceCss()}]]></style></defs>
  <rect width="100%" height="100%" fill="${spec.background}"/>
  <text x="${x}" y="${firstBaseline}" text-anchor="${textAnchor}"
    font-family="${fontStack(spec.fontFamily, spec.fontWeight)}"
    font-size="${spec.fontSize}"
    font-weight="${spec.fontWeight}"
    fill="${spec.color}">${tspans}</text>
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

export function inkImageUrl(siteUrl: string, style: InkStyle, text: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  const sig = signInkPayload(style, text);
  const params = new URLSearchParams({
    style,
    text,
    sig,
  });
  return `${base}/api/email-ink?${params.toString()}`;
}

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import sharp from "sharp";

import {
  isInkStyle,
  renderInkPng,
  resolveInkFontFiles,
  signInkPayload,
  verifyInkPayload,
} from "./email-ink.server.ts";

test("ink styles are whitelisted", () => {
  assert.equal(isInkStyle("cell"), true);
  assert.equal(isInkStyle("stat-amt"), true);
  assert.equal(isInkStyle("not-a-style"), false);
});

test("ink signatures verify only matching style+text", () => {
  const sig = signInkPayload("cell", "Build Your Own 3-Bar Bundle × 1");
  assert.equal(verifyInkPayload("cell", "Build Your Own 3-Bar Bundle × 1", sig), true);
  assert.equal(verifyInkPayload("cell", "tampered", sig), false);
  assert.equal(verifyInkPayload("cell-right", "Build Your Own 3-Bar Bundle × 1", sig), false);
});

test("bundled Liberation TTFs resolve for ink rendering", () => {
  const files = resolveInkFontFiles();
  assert.equal(files.length, 3);
  for (const file of files) {
    assert.ok(existsSync(file), `missing font file: ${file}`);
  }
});

/**
 * Count non-background pixels. Missing fonts yield hollow .notdef “tofu” boxes
 * with far fewer ink pixels than real Liberation glyphs for the same string.
 */
async function countInkPixels(png: Buffer, backgroundHex: string) {
  const r0 = Number.parseInt(backgroundHex.slice(1, 3), 16);
  const g0 = Number.parseInt(backgroundHex.slice(3, 5), 16);
  const b0 = Number.parseInt(backgroundHex.slice(5, 7), 16);
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let ink = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] as number;
    const g = data[i + 1] as number;
    const b = data[i + 2] as number;
    if (Math.abs(r - r0) > 12 || Math.abs(g - g0) > 12 || Math.abs(b - b0) > 12) {
      ink += 1;
    }
  }
  return { ink, width: info.width, height: info.height, bytes: png.length };
}

test("ink smoke: LH-999999 is readable glyphs, not tofu boxes", async () => {
  const png = await renderInkPng("stat-num", "LH-999999");
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  // Empty-fontconfig tofu for this string was ~185B / ~324 ink px; real glyphs are ~1.5KB+ / ~650+.
  assert.ok(png.length > 800, `PNG suspiciously small (${png.length}B) — fonts likely not registered`);
  const { ink, width, height } = await countInkPixels(png, "#fff3db");
  assert.ok(
    ink >= 500,
    `only ${ink} ink pixels on ${width}x${height} — tofu .notdef boxes leave hollow outlines`,
  );
});

test("ink smoke: bundle line item paints real glyphs", async () => {
  const label = "Build Your Own 3-Bar Bundle × 1";
  const png = await renderInkPng("cell", label);
  assert.ok(png.length > 1200, `PNG suspiciously small (${png.length}B)`);
  const { ink } = await countInkPixels(png, "#fbf3e2");
  assert.ok(ink >= 900, `only ${ink} ink pixels for line item — possible tofu`);
});

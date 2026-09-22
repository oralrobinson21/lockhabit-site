import assert from "node:assert/strict";
import test from "node:test";

import { isInkStyle, renderInkPng, signInkPayload, verifyInkPayload } from "./email-ink.server.ts";

test("ink styles are whitelisted", () => {
  assert.equal(isInkStyle("cell"), true);
  assert.equal(isInkStyle("stat-amt"), true);
  assert.equal(isInkStyle("not-a-style"), false);
});

test("ink signatures verify only matching style+text", () => {
  const sig = signInkPayload("cell", "Coconut Beach Soap × 1");
  assert.equal(verifyInkPayload("cell", "Coconut Beach Soap × 1", sig), true);
  assert.equal(verifyInkPayload("cell", "tampered", sig), false);
  assert.equal(verifyInkPayload("cell-right", "Coconut Beach Soap × 1", sig), false);
});

test("ink renderer returns a PNG buffer", async () => {
  const png = await renderInkPng("stat-num", "LH-999999");
  assert.ok(png.length > 100);
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
});

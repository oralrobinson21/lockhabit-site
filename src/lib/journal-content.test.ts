import assert from "node:assert/strict";
import test from "node:test";
import { editableJournalBody, editableJournalRecommendations, isSafeExternalUrl, parseJournalBlocks, publishedJournalBlocks, validatedJournalReferences, validateJournalForPublication } from "./journal-content";

test("Journal body round trips headings, prose, own products and clearly typed paid links", () => {
  const blocks = parseJournalBlocks(
    "A thoughtful introduction.\n\n## What the source actually says\n\nA useful finding with limitations.",
    "own | LockHabit product | coconut-beach-soap | Our own bar.\naffiliate | Travel pouch | https://partner.example/pouch | Optional outside pick.",
  );
  assert.equal(blocks.length, 5);
  assert.match(editableJournalBody(blocks), /## What the source actually says/);
  assert.match(editableJournalRecommendations(blocks), /affiliate \| Travel pouch/);
  assert.deepEqual(publishedJournalBlocks(blocks), blocks);
});

test("Outside links reject script, insecure and credential-in-URL schemes", () => {
  for (const url of ["javascript:alert(1)", "http://partner.example", "https://u:p@partner.example", "data:text/html,a"]) {
    assert.equal(isSafeExternalUrl(url), false);
    assert.throws(() => parseJournalBlocks("Intro", `affiliate | Bag | ${url} | Note`));
  }
  assert.throws(() => parseJournalBlocks("Intro", "affiliate | Bag | https://lockhabit.com/item | Note"));
});

test("Owner cannot add invalid product paths, malformed recommendations or unsourced citations", () => {
  assert.throws(() => parseJournalBlocks("Intro", "own | LockHabit | ../../invented-soap | Note"));
  assert.throws(() => parseJournalBlocks("Intro", "affiliate | Product | https://partner.example"));
  assert.throws(() => validatedJournalReferences("http://insecure.example/study"));
  assert.deepEqual(validatedJournalReferences("https://www.ftc.gov/business-guidance\nhttps://example.org/research"), ["https://www.ftc.gov/business-guidance", "https://example.org/research"]);
});

test("Published content ignores unknown blocks and unsafe legacy links", () => {
  assert.deepEqual(publishedJournalBlocks([{ type: "affiliate", label: "Bad", url: "javascript:alert(1)", note: "Bad" }, { type: "paragraph", text: "Safe." }, { type: "unknown", text: "No" }]), [{ type: "paragraph", text: "Safe." }]);
});

test("Publish gate holds short or uncited articles and missing image alt text", () => {
  const references = ["https://example.org/study", "https://example.edu/review"];
  assert.throws(() => validateJournalForPublication("Short copy", references, "", ""));
  const body = Array.from({ length: 250 }, () => "word").join(" ");
  assert.throws(() => validateJournalForPublication(body, references.slice(0, 1), "", ""));
  assert.throws(() => validateJournalForPublication(body, references, "https://example.org/photo.jpg", ""));
  assert.doesNotThrow(() => validateJournalForPublication(body, references, "", ""));
});

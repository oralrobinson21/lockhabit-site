import assert from "node:assert/strict";
import { test } from "node:test";

import { creatorDisplayBalances, creatorEntryLabel, creatorStatusLabel } from "./creator-balance";

test("refund during the return hold reduces pending, never shows negative available", () => {
  assert.deepEqual(creatorDisplayBalances(350, -100), { pendingCents: 250, availableCents: 0 });
  assert.deepEqual(creatorDisplayBalances(350, 500), { pendingCents: 350, availableCents: 500 });
  assert.deepEqual(creatorDisplayBalances(0, -100), { pendingCents: 0, availableCents: 0 });
});

test("creator ledger labels are readable", () => {
  assert.equal(creatorEntryLabel("refund_adjustment"), "Refund adjustment");
  assert.equal(creatorStatusLabel("pending"), "Pending (return hold)");
  assert.equal(creatorStatusLabel("unknown"), "unknown");
});

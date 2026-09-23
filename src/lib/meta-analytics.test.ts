import assert from "node:assert/strict";
import test from "node:test";

import { trackMetaEvent, trackMetaEventOnce } from "./meta-analytics";

test("Meta pixel failure never prevents checkout", () => {
  const globalWithWindow = globalThis as unknown as { window?: unknown };
  const previous = globalWithWindow.window;
  globalWithWindow.window = {
    sessionStorage: {
      getItem: () => { throw new Error("storage access denied"); },
      setItem: () => { throw new Error("storage access denied"); },
    },
    fbq: () => { throw new Error("pixel blocked"); },
  };
  try {
    assert.doesNotThrow(() => trackMetaEvent("AddToCart", { value: 35 }));
    assert.doesNotThrow(() => trackMetaEventOnce("blocked-pixel", "InitiateCheckout"));
  } finally {
    if (previous === undefined) delete globalWithWindow.window;
    else globalWithWindow.window = previous;
  }
});

test("Meta pixel events deduplicate even if storage is disabled", () => {
  const globalWithWindow = globalThis as unknown as { window?: unknown };
  const previous = globalWithWindow.window;
  const calls: unknown[][] = [];
  globalWithWindow.window = {
    sessionStorage: {
      getItem: () => { throw new Error("storage access denied"); },
      setItem: () => { throw new Error("storage access denied"); },
    },
    fbq: (...args: unknown[]) => calls.push(args),
  };
  try {
    trackMetaEventOnce("private-checkout-unique", "InitiateCheckout", { currency: "USD" });
    trackMetaEventOnce("private-checkout-unique", "InitiateCheckout", { currency: "USD" });
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], ["track", "InitiateCheckout", { currency: "USD" }]);
  } finally {
    if (previous === undefined) delete globalWithWindow.window;
    else globalWithWindow.window = previous;
  }
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveClientStripeConfig,
  validatePublishableKey,
  validateServerKey,
} from "./stripe-config";

test("test mode deterministically selects the test publishable key", () => {
  assert.deepEqual(
    resolveClientStripeConfig({
      VITE_STRIPE_MODE: "test",
      VITE_PAYMENTS_CLIENT_TOKEN: "pk_test_example",
      VITE_PAYMENTS_CLIENT_TOKEN_LIVE: "pk_live_example",
    }),
    { mode: "test", key: "pk_test_example" },
  );
});

test("live mode deterministically selects the live publishable key", () => {
  assert.deepEqual(
    resolveClientStripeConfig({
      VITE_STRIPE_MODE: "live",
      VITE_PAYMENTS_CLIENT_TOKEN: "pk_test_example",
      VITE_PAYMENTS_CLIENT_TOKEN_LIVE: "pk_live_example",
    }),
    { mode: "live", key: "pk_live_example" },
  );
});

test("missing or cross-mode publishable keys fail clearly", () => {
  assert.throws(() => resolveClientStripeConfig({ VITE_STRIPE_MODE: "test" }), /not configured/);
  assert.throws(() => validatePublishableKey("test", "pk_live_example"), /pk_test_/);
  assert.throws(() => validatePublishableKey("live", "pk_test_example"), /pk_live_/);
});

test("server keys cannot be paired with the wrong mode", () => {
  assert.equal(validateServerKey("test", "sk_test_example"), "sk_test_example");
  assert.equal(validateServerKey("live", "rk_live_example"), "rk_live_example");
  assert.throws(() => validateServerKey("test", "sk_live_example"), /test Stripe server key/);
  assert.throws(() => validateServerKey("live", "rk_test_example"), /live Stripe server key/);
});

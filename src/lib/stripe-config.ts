export type StripeMode = "test" | "live";

export function parseStripeMode(value: string | undefined, name: string): StripeMode {
  const mode = value?.trim().toLowerCase();
  if (mode === "test" || mode === "live") return mode;
  throw new Error(`${name} must be explicitly set to test or live`);
}

export function validatePublishableKey(mode: StripeMode, key: string | undefined): string {
  if (!key) throw new Error(`Stripe ${mode} publishable key is not configured`);
  const expectedPrefix = mode === "test" ? "pk_test_" : "pk_live_";
  if (!key.startsWith(expectedPrefix)) {
    throw new Error(`STRIPE_MODE=${mode} requires a ${expectedPrefix} publishable key`);
  }
  return key;
}

export function validateServerKey(mode: StripeMode, key: string): string {
  const expectedPrefixes = mode === "test" ? ["sk_test_", "rk_test_"] : ["sk_live_", "rk_live_"];
  if (!expectedPrefixes.some((prefix) => key.startsWith(prefix))) {
    throw new Error(`STRIPE_MODE=${mode} requires a ${mode} Stripe server key`);
  }
  return key;
}

export function resolveClientStripeConfig(env: Record<string, string | undefined>) {
  const mode = parseStripeMode(env["VITE_STRIPE_MODE"], "VITE_STRIPE_MODE");
  const key = validatePublishableKey(
    mode,
    mode === "test" ? env["VITE_PAYMENTS_CLIENT_TOKEN"] : env["VITE_PAYMENTS_CLIENT_TOKEN_LIVE"],
  );
  return { mode, key };
}

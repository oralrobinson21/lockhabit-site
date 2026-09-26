import { createFileRoute } from "@tanstack/react-router";

/**
 * Non-secret deploy probe so Railway hosts can be proven to match a merge SHA.
 * Never include env secrets or Stripe keys here.
 */
function resolveGitSha(): string {
  const candidates = [
    process.env["RAILWAY_GIT_COMMIT_SHA"],
    process.env["RAILWAY_GIT_COMMIT"],
    process.env["SOURCE_VERSION"],
    process.env["COMMIT_SHA"],
    process.env["GIT_COMMIT"],
    process.env["VERCEL_GIT_COMMIT_SHA"],
  ];
  for (const value of candidates) {
    if (value && /^[0-9a-f]{7,40}$/i.test(value.trim())) return value.trim().toLowerCase();
  }
  return "unknown";
}

export const Route = createFileRoute("/api/version")({
  server: {
    handlers: {
      GET: async () => {
        const sha = resolveGitSha();
        const body = {
          service: "lockhabit-site",
          sha,
          shortSha: sha === "unknown" ? "unknown" : sha.slice(0, 7),
          builtAt: process.env["BUILD_TIME"] ?? null,
          railwayEnvironment: process.env["RAILWAY_ENVIRONMENT_NAME"] ?? null,
          stripeMode: process.env["STRIPE_MODE"] ?? process.env["VITE_STRIPE_MODE"] ?? null,
        };
        return Response.json(body, {
          headers: {
            "cache-control": "no-store",
            "x-lockhabit-sha": body.shortSha,
          },
        });
      },
    },
  },
});

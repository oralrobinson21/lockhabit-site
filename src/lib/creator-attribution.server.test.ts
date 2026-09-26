import assert from "node:assert/strict";
import test from "node:test";

import { resolveCreatorAttribution } from "./creator-attribution.server";

function fakeSupabase(handlers: {
  code?: { id: string; referral_code: string; commission_bps: number; status: string } | null;
  click?: { attribution_token: string; creator_id: string; expires_at: string } | null;
  tokenProfile?: { id: string; referral_code: string; commission_bps: number; status: string } | null;
}) {
  return {
    from(table: string) {
      if (table === "creator_profiles") {
        return {
          select() {
            return {
              eq(_column: string, value: string) {
                const isCodeLookup = value === handlers.code?.referral_code;
                return {
                  eq() {
                    return {
                      async maybeSingle() {
                        if (isCodeLookup) return { data: handlers.code, error: null };
                        return { data: handlers.tokenProfile, error: null };
                      },
                    };
                  },
                  async maybeSingle() {
                    return { data: handlers.tokenProfile, error: null };
                  },
                };
              },
            };
          },
        };
      }
      if (table === "creator_referral_clicks") {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return { data: handlers.click, error: null };
                  },
                };
              },
            };
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

test("typed creator code overrides referral token attribution", async () => {
  const result = await resolveCreatorAttribution(
    fakeSupabase({
      code: {
        id: "creator-code",
        referral_code: "SUNNY",
        commission_bps: 1000,
        status: "active",
      },
      click: {
        attribution_token: "11111111-1111-1111-1111-111111111111",
        creator_id: "creator-token",
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
      tokenProfile: {
        id: "creator-token",
        referral_code: "TOKEN",
        commission_bps: 1000,
        status: "active",
      },
    }) as never,
    {
      creatorCode: "SUNNY",
      attributionToken: "11111111-1111-1111-1111-111111111111",
    },
  );
  assert.equal(result?.creatorId, "creator-code");
  assert.equal(result?.source, "code");
});

test("paused creators do not attribute from code or token", async () => {
  const result = await resolveCreatorAttribution(
    fakeSupabase({
      code: null,
      click: {
        attribution_token: "11111111-1111-1111-1111-111111111111",
        creator_id: "creator-token",
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
      tokenProfile: null,
    }) as never,
    { attributionToken: "11111111-1111-1111-1111-111111111111" },
  );
  assert.equal(result, null);
});

test("expired referral tokens do not attribute", async () => {
  const result = await resolveCreatorAttribution(
    fakeSupabase({
      click: {
        attribution_token: "11111111-1111-1111-1111-111111111111",
        creator_id: "creator-token",
        expires_at: new Date(Date.now() - 1000).toISOString(),
      },
      tokenProfile: {
        id: "creator-token",
        referral_code: "TOKEN",
        commission_bps: 1000,
        status: "active",
      },
    }) as never,
    { attributionToken: "11111111-1111-1111-1111-111111111111" },
  );
  assert.equal(result, null);
});

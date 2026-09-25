# Phone / SMS later — without redesign

Phone is **additive** on the same Oral21 / us-east-1 footprint. Soft-hosting sites
do not block phone Soft work, and phone Soft must not force a website Soft redesign.

## Near-term Soft path (preferred)

**Keep Twilio Soft** for product voice/SMS (Halenor Soft PRs #630 / #650 / #635 era:
Soft cert matrix, LIVE cutover gate, Compliance Embeddable).

| Soft rule | Detail |
| --- | --- |
| Soft TEST first | Soft numbers / Soft Messaging Service only |
| LIVE cutover gated | Same Soft HOLD spirit as DNS — Oral GO |
| Tags if any AWS wrap | `app=halenor` (or product), `env=preview\|prod` |
| Secrets | Twilio Auth Token Soft in Secrets Manager / CI — never git |

Website Soft stacks Soft-ignore Twilio. No Soft coupling required.

## Optional later: AWS SNS / Pinpoint

Use only if product Soft-needs AWS-native SMS/push:

| Service | Soft fit |
| --- | --- |
| **SNS** | Alarms (already used: `halenor-email-alarms-test`) + simple SMS Soft |
| **Pinpoint** | Campaigns / journeys Soft — Soft-add when marketing Soft-needs it |

Soft-add pattern (same spirit as Site N):

1. Soft module / stack named `{app}-{env}-phone`
2. Tags `app` + `env=preview`
3. Soft TEST origination identity only
4. Soft HOLD on production numbers / 10DLC LIVE until Oral GO
5. Do **not** touch Zoho MX or site DNS

## What Soft website + Soft email already prove

- One account works for Soft email + Soft hosting + Soft alarms (SNS)
- Tagging scales Cost Explorer views without a new AWS Organization
- Soft HOLD discipline transfers cleanly to phone LIVE gates

## Explicit Soft non-goals now

- Buying production toll-free or 10DLC LIVE in this PR
- Replacing Twilio with SNS for product SMS yet
- Wiring phone into LockHabit App Runner Soft preview

When ready: extend Halenor phone Soft docs, or add an `infra/aws-soft-phone/` sibling
with the same tags — **not** a platform rewrite.

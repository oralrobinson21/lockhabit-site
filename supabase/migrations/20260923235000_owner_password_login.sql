-- Owner-only password setup challenges for /admin/orders.
-- Codes are stored as server-HMAC digests, expire quickly, and are inaccessible to browser roles.
CREATE TABLE IF NOT EXISTS public.order_admin_password_challenges (
  email text PRIMARY KEY,
  code_digest text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_admin_password_challenges_attempts_check CHECK (attempts >= 0 AND attempts <= 10),
  CONSTRAINT order_admin_password_challenges_digest_check CHECK (length(code_digest) = 64)
);

ALTER TABLE public.order_admin_password_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_admin_password_challenges FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_admin_password_challenges TO service_role;

-- Additive, owner-only shipping metadata on existing paid orders.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_carrier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS tracking_notified_at timestamptz;

-- Atomic per-inbox throttling for the owner login email. This table has no public policies.
CREATE TABLE IF NOT EXISTS public.order_admin_login_requests (
  email text PRIMARY KEY,
  last_sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_admin_login_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_admin_login_requests FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.order_admin_login_requests TO service_role;

CREATE OR REPLACE FUNCTION public.claim_lockhabit_admin_login(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_claimed boolean;
BEGIN
  INSERT INTO public.order_admin_login_requests AS req(email, last_sent_at)
  VALUES (lower(trim(p_email)), now())
  ON CONFLICT(email) DO UPDATE
    SET last_sent_at = EXCLUDED.last_sent_at
    WHERE req.last_sent_at < now() - interval '90 seconds'
  RETURNING true INTO v_claimed;
  RETURN coalesce(v_claimed, false);
END;
$$;
REVOKE ALL ON FUNCTION public.claim_lockhabit_admin_login(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_lockhabit_admin_login(text) TO service_role;

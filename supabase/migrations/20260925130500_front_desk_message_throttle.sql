-- Persistent, atomic one-minute throttle for public Contact / front-desk messages.
-- Store only a one-way sender key, never the raw email address.
CREATE TABLE IF NOT EXISTS public.front_desk_message_requests (
  sender_key text PRIMARY KEY,
  last_sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.front_desk_message_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.front_desk_message_requests FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.front_desk_message_requests TO service_role;

CREATE OR REPLACE FUNCTION public.claim_front_desk_message(p_sender_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_claimed boolean;
BEGIN
  INSERT INTO public.front_desk_message_requests AS req(sender_key, last_sent_at)
  VALUES (trim(p_sender_key), now())
  ON CONFLICT(sender_key) DO UPDATE
    SET last_sent_at = EXCLUDED.last_sent_at
    WHERE req.last_sent_at < now() - interval '60 seconds'
  RETURNING true INTO v_claimed;

  RETURN coalesce(v_claimed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_front_desk_message(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_front_desk_message(text) TO service_role;

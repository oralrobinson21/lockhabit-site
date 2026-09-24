-- Add owner-entered estimated delivery date for shipped-order customer notifications.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS estimated_delivery_date date;

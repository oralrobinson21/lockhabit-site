CREATE POLICY "Store service manages fulfillment orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
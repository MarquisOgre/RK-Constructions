CREATE TABLE public.property_callback_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 property_slug text NOT NULL CHECK (property_slug IN ('rk-heights','rk-green-villas','rk-business-park','rk-urban-living')),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
 phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
 email text CHECK (email IS NULL OR char_length(email) <= 254),
 preferred_time text NOT NULL CHECK (char_length(preferred_time) <= 100),
 message text CHECK (message IS NULL OR char_length(message) <= 1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.property_callback_requests TO service_role;
ALTER TABLE public.property_callback_requests ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.property_callback_requests IS 'Private buyer callback requests; only server-side validated submissions may insert, no public read policy';
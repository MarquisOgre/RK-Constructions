CREATE TABLE public.properties (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9-]{2,80}$'),
  name text NOT NULL, detail text NOT NULL DEFAULT '', location text NOT NULL,
  price text NOT NULL, price_lakhs numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Residential', badge text NOT NULL DEFAULT '', status text NOT NULL DEFAULT '',
  units text[] NOT NULL DEFAULT '{}', amenities text[] NOT NULL DEFAULT '{}', specifications text[] NOT NULL DEFAULT '{}',
  image_url text, published boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published properties" ON public.properties FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read properties" ON public.properties FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update properties" ON public.properties FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete properties" ON public.properties FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.properties (slug,name,detail,location,price,price_lakhs,category,badge,status,units,amenities,specifications,sort_order) VALUES
('rk-heights','RK Heights','Premium 2 & 3 BHK Apartments','Hyderabad','₹75 Lakhs',75,'Residential','New Launch','New Launch',ARRAY['2 BHK apartments','3 BHK apartments'],ARRAY['Landscaped grounds','Fitness space','Resident parking','Community gathering space'],ARRAY['Contemporary apartment layouts','Natural light-focused design','Dedicated residential access'],1),
('rk-green-villas','RK Green Villas','Luxury 4 BHK Villas','Bengaluru','₹2.5 Crores',250,'Residential','Luxury','Luxury Homes',ARRAY['4 BHK villas'],ARRAY['Private outdoor space','Landscaped paths','Resident parking','Family living areas'],ARRAY['Independent villa format','Spacious multi-room layout','Indoor-outdoor living concept'],2),
('rk-business-park','RK Business Park','Premium Office Spaces','Chennai','₹80 Lakhs',80,'Commercial','Commercial','Commercial',ARRAY['Office spaces','Flexible commercial units'],ARRAY['Visitor reception','Parking','Common circulation areas','Business-ready setting'],ARRAY['Flexible office configurations','Contemporary commercial frontage','Designed for professional use'],3),
('rk-urban-living','RK Urban Living','Modern 1, 2 & 3 BHK Homes','Pune','₹65 Lakhs',65,'Residential','Ready to Move','Ready to Move',ARRAY['1 BHK apartments','2 BHK apartments','3 BHK apartments'],ARRAY['Shared green space','Fitness space','Resident parking','Community area'],ARRAY['Practical apartment layouts','Natural light-focused design','Urban residential setting'],4);

ALTER TABLE public.property_callback_requests DROP CONSTRAINT IF EXISTS property_callback_requests_property_slug_check;

CREATE TABLE public.inquiry_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('callback','message')),
  inquiry_id uuid NOT NULL, sent_to text NOT NULL, body text NOT NULL,
  delivery text NOT NULL DEFAULT 'queued', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiry_replies_inquiry_idx ON public.inquiry_replies (inquiry_id);
GRANT SELECT ON public.inquiry_replies TO authenticated;
GRANT ALL ON public.inquiry_replies TO service_role;
ALTER TABLE public.inquiry_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read replies" ON public.inquiry_replies FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.blog_posts (slug,title,excerpt,content,property_slug,milestone,published,published_at) VALUES
('sample-rk-heights-foundation','[Sample] RK Heights: foundation work update','Sample article — replace with your real progress update.','This is a sample article to show how construction updates appear on the website. Replace it with real progress from the site, such as dates, completed stages and photos, from your dashboard.

Example structure: what was completed this month, what comes next, and when buyers can expect the next milestone.','rk-heights','Sample: Foundation',true,now() - interval '20 days'),
('sample-rk-green-villas-landscaping','[Sample] RK Green Villas: landscaping and site layout','Sample article — replace with your real progress update.','This is a sample article for RK Green Villas. Use it as a template for sharing real updates about site layout, landscaping and villa construction stages.

Edit or delete it any time from your dashboard.','rk-green-villas','Sample: Site layout',true,now() - interval '14 days'),
('sample-rk-business-park-structure','[Sample] RK Business Park: structural progress','Sample article — replace with your real progress update.','This is a sample article for RK Business Park. Replace it with real details about structural work, floors completed and upcoming fit-out stages.

Edit or delete it any time from your dashboard.','rk-business-park','Sample: Structure',true,now() - interval '8 days'),
('sample-rk-urban-living-handover','[Sample] RK Urban Living: handover preparations','Sample article — replace with your real progress update.','This is a sample article for RK Urban Living. Replace it with real information about finishing work, inspections and handover timelines.

Edit or delete it any time from your dashboard.','rk-urban-living','Sample: Handover',true,now() - interval '2 days');
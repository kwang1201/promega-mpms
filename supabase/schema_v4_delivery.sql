-- V4: Add expected delivery date + brand assets storage setup
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

-- Ensure brand-assets bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Brand assets storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can upload brand assets' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated can upload brand assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can view brand assets' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated can view brand assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'brand-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can delete brand assets' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated can delete brand assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-assets');
  END IF;
END $$;

-- Brand assets table INSERT policy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can insert brand assets' AND tablename = 'brand_assets') THEN
    CREATE POLICY "Authenticated can insert brand assets" ON public.brand_assets FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can view brand assets table' AND tablename = 'brand_assets') THEN
    CREATE POLICY "Authenticated can view brand assets table" ON public.brand_assets FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can delete brand assets table' AND tablename = 'brand_assets') THEN
    CREATE POLICY "Authenticated can delete brand assets table" ON public.brand_assets FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

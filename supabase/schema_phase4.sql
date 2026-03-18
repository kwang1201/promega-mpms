-- =============================================
-- Phase 4 DB Schema — Brand Assets
-- Supabase SQL Editor에서 실행
-- =============================================

CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('logo', 'color', 'template', 'font', 'guideline', 'other')),
  description TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  thumbnail_path TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brand_assets_category ON brand_assets(category);

-- RLS
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view brand assets"
  ON brand_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MS can manage brand assets"
  ON brand_assets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ms_staff', 'ms_manager')
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', false);

CREATE POLICY "Authenticated users can view brand asset files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'brand-assets');

CREATE POLICY "MS can upload brand asset files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets' AND
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ms_staff', 'ms_manager')
    )
  );

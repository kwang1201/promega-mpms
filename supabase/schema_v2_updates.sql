-- V2 Updates: Role rename, agency assignment, user company field
-- Run in Supabase SQL Editor

-- 1. Add company field to users (for agency users)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;

-- 2. Add agency_id to projects (references users with agency role)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.users(id);

-- 3. Update existing 'owner' role to 'user'
UPDATE public.users SET role = 'user' WHERE role = 'owner';

-- 4. Update role check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'ms_staff', 'ms_manager', 'agency', 'scm'));

-- 5. Update trigger to include company field
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'company'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketing-files', 'marketing-files', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policies (skip if already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload files'
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'marketing-files');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view files'
    AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can view files"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'marketing-files');
  END IF;
END $$;

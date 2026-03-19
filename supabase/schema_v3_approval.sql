-- V3: User approval process + remove SCM role
-- Run in Supabase SQL Editor

-- 1. Add status column to users (pending/approved/rejected)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 2. Set existing users to approved (they were already using the system)
UPDATE public.users SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 3. Update role check constraint (remove scm)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'ms_staff', 'ms_manager', 'agency'));

-- 4. Update trigger to set new users as pending
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, company, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'company',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update existing scm users to user role
UPDATE public.users SET role = 'user' WHERE role = 'scm';

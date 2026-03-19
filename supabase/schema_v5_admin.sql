-- V5: Add admin role
-- Run in Supabase SQL Editor

-- Update role check constraint to include admin
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'user', 'ms_staff', 'ms_manager', 'agency'));

-- Set your account as admin (replace with your email)
-- UPDATE public.users SET role = 'admin' WHERE email = 'kwangil.kim@promega.com';

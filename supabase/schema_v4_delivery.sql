-- V4: Add expected delivery date to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

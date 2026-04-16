-- V6: Expanded Track Types + Type Metadata + Workflow Extension
-- Run in Supabase SQL Editor

-- 1. Add type_metadata JSONB column to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS type_metadata JSONB DEFAULT '{}';

-- 2. Migrate existing track types
UPDATE public.projects SET track_type = 'brochure' WHERE track_type = 'print';
UPDATE public.projects SET track_type = 'booth_backwall' WHERE track_type = 'booth';
UPDATE public.projects SET track_type = 'banner_signage' WHERE track_type = 'banner';

-- 3. Update track_type CHECK constraint
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_track_type_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_track_type_check
  CHECK (track_type IN (
    'poster', 'brochure', 'reprint', 'booth_backwall', 'banner_signage',
    'digital_image', 'other_prints', 'giveaway', 'survey'
  ));

-- 4. Expand status CHECK constraint (12 steps)
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    'draft', 'ms_review', 'owner_review',
    'quotation_request', 'quotation_received', 'quotation_approved',
    'in_production', 'design_review', 'print_request', 'delivery',
    'invoice', 'completed'
  ));

-- 5. Migrate existing 'released' status to 'in_production'
UPDATE public.projects SET status = 'in_production' WHERE status = 'released';

-- 6. Add actual_delivery_date column
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;

-- 7. Add review_phase column to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS review_phase TEXT DEFAULT 'ms_review'
  CHECK (review_phase IN ('ms_review', 'design_review'));

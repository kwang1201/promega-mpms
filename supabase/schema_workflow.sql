-- Workflow Redesign Migration
-- 10-stage project workflow
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Update projects.status CHECK constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    'draft',
    'ms_review',
    'owner_review',
    'quotation_request',
    'quotation_received',
    'quotation_approved',
    'released',
    'in_production',
    'invoice',
    'completed'
  ));

-- 2. Migrate existing project statuses
UPDATE projects SET status = 'quotation_request' WHERE status = 'quotation';
UPDATE projects SET status = 'ms_review' WHERE status = 'in_review';
UPDATE projects SET status = 'quotation_approved' WHERE status = 'approved';
UPDATE projects SET status = 'released' WHERE status = 'final_prep';

-- 3. Add file_category column to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_category TEXT DEFAULT 'general'
  CHECK (file_category IN ('general', 'design', 'quotation', 'invoice'));

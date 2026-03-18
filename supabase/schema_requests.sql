-- =============================================
-- Independent Requests — projects without conference
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. projects.conference_id를 nullable로 변경
ALTER TABLE projects ALTER COLUMN conference_id DROP NOT NULL;

-- 2. track_type에 'print' 추가
ALTER TABLE projects DROP CONSTRAINT projects_track_type_check;
ALTER TABLE projects ADD CONSTRAINT projects_track_type_check
  CHECK (track_type IN ('booth', 'banner', 'giveaway', 'poster', 'survey', 'print'));

-- 3. requester 필드 추가 (요청자)
ALTER TABLE projects ADD COLUMN requester_id UUID REFERENCES users(id);
ALTER TABLE projects ADD COLUMN request_type TEXT DEFAULT 'conference'
  CHECK (request_type IN ('conference', 'independent'));

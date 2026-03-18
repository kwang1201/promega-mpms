-- =============================================
-- 마케팅 프로세스 관리 시스템 - Phase 1 DB Schema
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. agencies (외주업체)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. users (사용자 프로필)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'ms_staff', 'ms_manager', 'agency', 'scm')),
  agency_id UUID REFERENCES agencies(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. conferences (학회/전시)
CREATE TABLE conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  location TEXT,
  owner_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'quotation', 'production', 'review', 'final_prep', 'completed', 'settled')),
  budget NUMERIC(12,0) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. projects (병렬 트랙별 제작 프로젝트)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  track_type TEXT NOT NULL
    CHECK (track_type IN ('booth', 'banner', 'giveaway', 'poster', 'survey')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'quotation', 'in_production', 'in_review', 'approved', 'final_prep', 'completed')),
  deadline DATE,
  agency_id UUID REFERENCES agencies(id),
  assignee_id UUID REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. files (파일 및 버전 관리)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  file_size BIGINT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  uploader_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. activity_log (활동 로그)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  conference_id UUID REFERENCES conferences(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX idx_projects_conference ON projects(conference_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_activity_log_project ON activity_log(project_id);
CREATE INDEX idx_activity_log_conference ON activity_log(conference_id);
CREATE INDEX idx_conferences_status ON conferences(status);

-- =============================================
-- updated_at 자동 갱신 트리거
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_conferences_updated
  BEFORE UPDATE ON conferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 회원가입 시 users 테이블 자동 생성 트리거
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- agencies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agencies"
  ON agencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MS staff/manager can manage agencies"
  ON agencies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ms_staff', 'ms_manager')
    )
  );

-- conferences
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view conferences"
  ON conferences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owner and MS can create conferences"
  ON conferences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'ms_staff', 'ms_manager')
    )
  );

CREATE POLICY "Owner and MS can update conferences"
  ON conferences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'ms_staff', 'ms_manager')
    )
  );

CREATE POLICY "MS manager can delete conferences"
  ON conferences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ms_manager'
    )
  );

-- projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MS and owner can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'ms_staff', 'ms_manager')
    )
  );

CREATE POLICY "MS and owner can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'ms_staff', 'ms_manager')
    )
  );

CREATE POLICY "MS manager can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ms_manager'
    )
  );

-- files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view files"
  ON files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

-- activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Storage bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketing-files', 'marketing-files', false);

CREATE POLICY "Authenticated users can upload files to storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'marketing-files');

CREATE POLICY "Authenticated users can view files in storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'marketing-files');

CREATE POLICY "File uploaders can update their files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'marketing-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "File uploaders can delete their files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'marketing-files' AND auth.uid()::text = (storage.foldername(name))[1]);

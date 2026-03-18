-- =============================================
-- Phase 3 DB Schema — Cost Management
-- Supabase SQL Editor에서 실행
-- =============================================

-- cost_items (비용 항목: 견적서/계산서/기타)
CREATE TABLE cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('quotation', 'invoice', 'other')),
  description TEXT NOT NULL,
  vendor TEXT,
  amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  quote_file_id UUID REFERENCES files(id),
  invoice_file_id UUID REFERENCES files(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_cost_items_conference ON cost_items(conference_id);
CREATE INDEX idx_cost_items_project ON cost_items(project_id);
CREATE INDEX idx_cost_items_status ON cost_items(status);

-- updated_at 트리거
CREATE TRIGGER tr_cost_items_updated
  BEFORE UPDATE ON cost_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cost items"
  ON cost_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owner and MS can create cost items"
  ON cost_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'ms_staff', 'ms_manager')
    )
  );

CREATE POLICY "Owner and MS can update cost items"
  ON cost_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'ms_staff', 'ms_manager')
    )
  );

CREATE POLICY "MS manager can delete cost items"
  ON cost_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ms_manager'
    )
  );

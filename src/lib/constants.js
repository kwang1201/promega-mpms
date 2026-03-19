export const CONFERENCE_STATUS = {
  planning: { label: 'Planning', color: 'bg-[#EBE7E3] text-[#333333]' },
  quotation: { label: 'Quotation', color: 'bg-[#199AC2]/10 text-[#199AC2]' },
  production: { label: 'Production', color: 'bg-[#FDB813]/15 text-[#946d00]' },
  review: { label: 'Review', color: 'bg-[#713A61]/10 text-[#713A61]' },
  final_prep: { label: 'Final Prep', color: 'bg-[#455DA0]/10 text-[#455DA0]' },
  completed: { label: 'Completed', color: 'bg-[#199AC2]/15 text-[#13294B]' },
  settled: { label: 'Settled', color: 'bg-[#13294B]/10 text-[#13294B]' },
}

export const PROJECT_STATUS = {
  draft: { label: 'Draft', color: 'bg-[#EBE7E3] text-[#515151]', step: 1 },
  ms_review: { label: 'MS Review', color: 'bg-[#199AC2]/10 text-[#199AC2]', step: 2 },
  owner_review: { label: 'User Review', color: 'bg-[#713A61]/10 text-[#713A61]', step: 3 },
  quotation_request: { label: 'Quotation Request', color: 'bg-[#FDB813]/15 text-[#946d00]', step: 4 },
  quotation_received: { label: 'Quotation Received', color: 'bg-[#FDB813]/25 text-[#946d00]', step: 5 },
  quotation_approved: { label: 'Quotation Approved', color: 'bg-[#199AC2]/15 text-[#13294B]', step: 6 },
  released: { label: 'Released', color: 'bg-[#455DA0]/10 text-[#455DA0]', step: 7 },
  in_production: { label: 'In Production', color: 'bg-[#FDB813]/15 text-[#946d00]', step: 8 },
  invoice: { label: 'Invoice', color: 'bg-[#713A61]/10 text-[#713A61]', step: 9 },
  completed: { label: 'Completed', color: 'bg-[#13294B]/10 text-[#13294B]', step: 10 },
}

export const PROJECT_STATUS_ORDER = [
  'draft', 'ms_review', 'owner_review', 'quotation_request', 'quotation_received',
  'quotation_approved', 'released', 'in_production', 'invoice', 'completed'
]

export const AGENCY_VISIBLE_STATUSES = [
  'quotation_request', 'quotation_received', 'quotation_approved',
  'released', 'in_production', 'invoice', 'completed'
]

export const WORKFLOW_ACTIONS = {
  draft: [
    { key: 'submit_to_ms', label: 'MS팀에 제출', target: 'ms_review', roles: ['user', 'ms_staff', 'ms_manager'], variant: 'default' },
  ],
  ms_review: [
    { key: 'send_to_owner', label: 'User 검토 요청', target: 'owner_review', roles: ['ms_staff', 'ms_manager'], variant: 'default' },
    { key: 'skip_to_quotation', label: 'User 검토 생략 → 견적 요청', target: 'quotation_request', roles: ['ms_staff', 'ms_manager'], variant: 'secondary' },
    { key: 'return_to_draft', label: '초안으로 반려', target: 'draft', roles: ['ms_staff', 'ms_manager'], variant: 'destructive', confirm: true },
  ],
  owner_review: [
    { key: 'approve_to_quotation', label: '승인 → 견적 요청', target: 'quotation_request', roles: ['user', 'ms_manager'], variant: 'default' },
    { key: 'request_changes', label: '수정 요청', target: 'ms_review', roles: ['user', 'ms_manager'], variant: 'destructive', confirm: true },
  ],
  quotation_request: [
    { key: 'submit_quotation', label: '견적서 제출', target: 'quotation_received', roles: ['agency', 'ms_manager'], variant: 'default', requireFile: 'quotation' },
  ],
  quotation_received: [
    { key: 'send_for_approval', label: 'User 승인 요청', target: 'quotation_approved', roles: ['ms_staff', 'ms_manager'], variant: 'default' },
  ],
  quotation_approved: [
    { key: 'approve_quotation', label: '견적 승인', target: 'released', roles: ['user', 'ms_manager'], variant: 'default' },
    { key: 'reject_quotation', label: '견적 반려', target: 'quotation_received', roles: ['user', 'ms_manager'], variant: 'destructive', confirm: true },
  ],
  released: [
    { key: 'start_production', label: '제작 시작', target: 'in_production', roles: ['ms_staff', 'ms_manager'], variant: 'default' },
  ],
  in_production: [
    { key: 'submit_invoice', label: '세금계산서 제출', target: 'invoice', roles: ['agency'], variant: 'default', requireFile: 'invoice' },
  ],
  invoice: [
    { key: 'complete_project', label: '프로젝트 완료', target: 'completed', roles: ['user', 'ms_manager'], variant: 'default', confirm: true },
  ],
  completed: [],
}

export const TRACK_TYPES = {
  booth: { label: 'Booth/Wall', icon: '🏗️' },
  banner: { label: 'Banner', icon: '🖼️' },
  giveaway: { label: 'Giveaway', icon: '🎁' },
  poster: { label: 'Poster', icon: '📄' },
  survey: { label: 'Survey/Tent', icon: '📋' },
  print: { label: 'Literature', icon: '📑' },
}

export const ROLES = {
  user: 'User',
  ms_staff: 'MS Staff',
  ms_manager: 'MS Manager',
  agency: 'Agency',
}

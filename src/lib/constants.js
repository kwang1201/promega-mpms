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
  in_production: { label: 'In Production', color: 'bg-[#FDB813]/15 text-[#946d00]', step: 7 },
  design_review: { label: 'Design Review', color: 'bg-[#713A61]/10 text-[#713A61]', step: 8 },
  print_request: { label: 'Print Request', color: 'bg-[#455DA0]/10 text-[#455DA0]', step: 9 },
  delivery: { label: 'Delivery', color: 'bg-[#199AC2]/10 text-[#199AC2]', step: 10 },
  invoice: { label: 'Invoice', color: 'bg-[#713A61]/10 text-[#713A61]', step: 11 },
  completed: { label: 'Completed', color: 'bg-[#13294B]/10 text-[#13294B]', step: 12 },
}

export const PROJECT_STATUS_ORDER = [
  'draft', 'ms_review', 'owner_review', 'quotation_request', 'quotation_received',
  'quotation_approved', 'in_production', 'design_review', 'print_request', 'delivery',
  'invoice', 'completed'
]

export const AGENCY_VISIBLE_STATUSES = [
  'quotation_request', 'quotation_received', 'quotation_approved',
  'in_production', 'design_review', 'print_request', 'delivery',
  'invoice', 'completed'
]

// ----- TRACK TYPES -----
export const TRACK_TYPES = {
  poster: { label: 'Poster', icon: '📄' },
  brochure: { label: 'Brochure/Flyer', icon: '📑' },
  reprint: { label: 'Reprint', icon: '🔄' },
  booth_backwall: { label: 'Booth Backwall', icon: '🏗️' },
  banner_signage: { label: 'Banner & Signage', icon: '🖼️' },
  digital_image: { label: 'Digital Image', icon: '🖥️' },
  other_prints: { label: 'Other Prints', icon: '🖨️' },
  giveaway: { label: 'Giveaway', icon: '🎁' },
  survey: { label: 'Survey/Tent', icon: '📋' },
}

// ----- TRACK TYPE CONFIG (per-type form fields, MS Review skip) -----
export const TRACK_TYPE_CONFIG = {
  poster: {
    requiresMsReview: false,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'size', label: 'Size', type: 'select', options: ['Poster', 'Wall', 'Banner'], required: true },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  brochure: {
    requiresMsReview: true,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'key_message', label: 'Key Message Summary', type: 'textarea' },
      { key: 'design_notes', label: 'Design Notes', type: 'textarea' },
      { key: 'print_quantity', label: 'Print Quantity', type: 'number' },
      { key: 'quantity_type', label: 'Quantity Type', type: 'select', options: ['Exact', 'Approximate'] },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  reprint: {
    requiresMsReview: false,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'key_message', label: 'Key Message Summary', type: 'textarea' },
      { key: 'design_notes', label: 'Design Notes', type: 'textarea' },
      { key: 'print_quantity', label: 'Print Quantity', type: 'number' },
      { key: 'quantity_type', label: 'Quantity Type', type: 'select', options: ['Exact', 'Approximate'] },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  booth_backwall: {
    requiresMsReview: true,
    fields: [
      { key: 'booth_size', label: 'Booth Size', type: 'select', options: ['3m x 2.5m', '3m x 3m', '3m x 4m', '3m x 6m', 'Custom'], required: true },
      { key: 'booth_type', label: 'Booth Type', type: 'select', options: ['위탁', '독립 부스'] },
      { key: 'demo_desk_size', label: 'Demo Desk Size', type: 'text', placeholder: 'e.g. 1200x600x900' },
      { key: 'demo_desk_count', label: 'Demo Desk Count', type: 'number' },
      { key: 'display_counter_size', label: 'Display Counter Size', type: 'text', placeholder: 'e.g. 600x600x900' },
      { key: 'display_counter_count', label: 'Display Counter Count', type: 'number' },
      { key: 'monitor_size', label: 'Monitor Size (inch)', type: 'text', placeholder: 'e.g. 42inch' },
      { key: 'monitor_count', label: 'Monitor Count', type: 'number' },
      { key: 'power_table', label: 'Power Table', type: 'select', options: ['Standard Table', 'None'] },
      { key: 'catalog_count', label: 'Catalog Count', type: 'number' },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  banner_signage: {
    requiresMsReview: true,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  digital_image: {
    requiresMsReview: true,
    fields: [
      { key: 'purpose', label: 'Purpose', type: 'select', options: ['LinkedIn', 'Banner', 'Email', 'Web', 'Other'], required: true },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'size_reference', label: 'Size Reference', type: 'text' },
    ],
  },
  other_prints: {
    requiresMsReview: true,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'key_message', label: 'Key Message Summary', type: 'textarea' },
      { key: 'design_notes', label: 'Design Notes', type: 'textarea' },
      { key: 'print_quantity', label: 'Print Quantity', type: 'number' },
      { key: 'quantity_type', label: 'Quantity Type', type: 'select', options: ['Exact', 'Approximate'] },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  giveaway: {
    requiresMsReview: true,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
  survey: {
    requiresMsReview: true,
    fields: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'additional_requests', label: 'Additional Requests', type: 'textarea' },
    ],
  },
}

// ----- WORKFLOW ACTIONS -----
// Static definitions — use getWorkflowActions(project) for type-aware filtering
const _WORKFLOW_ACTIONS = {
  draft: [
    { key: 'submit_to_ms', label: 'MS팀에 제출', target: 'ms_review', roles: ['user', 'ms_staff', 'ms_manager'], variant: 'default', needsMsReview: true },
    { key: 'submit_direct', label: '견적 요청 진행', target: 'quotation_request', roles: ['user', 'ms_staff', 'ms_manager'], variant: 'default', needsMsReview: false },
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
    { key: 'approve_quotation', label: '견적 승인 → 제작 시작', target: 'in_production', roles: ['user', 'ms_manager'], variant: 'default', requireDate: true },
    { key: 'reject_quotation', label: '견적 반려', target: 'quotation_received', roles: ['user', 'ms_manager'], variant: 'destructive', confirm: true },
  ],
  in_production: [
    { key: 'submit_design', label: '디자인 제출', target: 'design_review', roles: ['agency', 'ms_staff', 'ms_manager'], variant: 'default' },
  ],
  design_review: [
    { key: 'approve_design', label: '디자인 승인 → 인쇄 요청', target: 'print_request', roles: ['user', 'ms_staff', 'ms_manager'], variant: 'default' },
    { key: 'request_revision', label: '수정 요청', target: 'in_production', roles: ['user', 'ms_staff', 'ms_manager'], variant: 'destructive', confirm: true },
  ],
  print_request: [
    { key: 'confirm_print', label: '인쇄 완료 → 납품 대기', target: 'delivery', roles: ['agency', 'ms_staff', 'ms_manager'], variant: 'default' },
  ],
  delivery: [
    { key: 'confirm_delivery', label: '납품 확인', target: 'invoice', roles: ['ms_staff', 'ms_manager'], variant: 'default', requireDate: true },
  ],
  invoice: [
    { key: 'submit_invoice', label: '세금계산서 제출', target: 'invoice', roles: ['agency', 'ms_staff', 'ms_manager'], variant: 'default', requireFile: 'invoice' },
    { key: 'complete_project', label: '프로젝트 완료', target: 'completed', roles: ['user', 'ms_manager'], variant: 'default', selectArchiveFiles: true },
  ],
  completed: [],
}

// Type-aware workflow actions getter
export function getWorkflowActions(project) {
  const status = project?.status
  if (!status) return []
  const actions = _WORKFLOW_ACTIONS[status] || []
  const config = TRACK_TYPE_CONFIG[project?.track_type]
  const requiresMsReview = config?.requiresMsReview !== false // default true

  return actions.filter(action => {
    // For draft status, filter based on whether MS review is needed
    if (action.needsMsReview === true && !requiresMsReview) return false
    if (action.needsMsReview === false && requiresMsReview) return false
    return true
  })
}

// Legacy export for backward compatibility
export const WORKFLOW_ACTIONS = _WORKFLOW_ACTIONS

export const ROLES = {
  admin: 'Admin',
  user: 'User',
  ms_staff: 'MS Staff',
  ms_manager: 'MS Manager',
  agency: 'Agency',
}

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
  draft: { label: 'Draft', color: 'bg-[#EBE7E3] text-[#515151]' },
  quotation: { label: 'Quotation', color: 'bg-[#199AC2]/10 text-[#199AC2]' },
  in_production: { label: 'Production', color: 'bg-[#FDB813]/15 text-[#946d00]' },
  in_review: { label: 'Review', color: 'bg-[#713A61]/10 text-[#713A61]' },
  approved: { label: 'Approved', color: 'bg-[#199AC2]/15 text-[#13294B]' },
  final_prep: { label: 'Final Prep', color: 'bg-[#455DA0]/10 text-[#455DA0]' },
  completed: { label: 'Completed', color: 'bg-[#13294B]/10 text-[#13294B]' },
}

export const PROJECT_STATUS_ORDER = [
  'draft', 'quotation', 'in_production', 'in_review', 'approved', 'final_prep', 'completed'
]

export const TRACK_TYPES = {
  booth: { label: 'Booth/Wall', icon: '🏗️' },
  banner: { label: 'Banner', icon: '🖼️' },
  giveaway: { label: 'Giveaway', icon: '🎁' },
  poster: { label: 'SCM Poster', icon: '📄' },
  survey: { label: 'Survey/Tent', icon: '📋' },
  print: { label: 'Print', icon: '🖨️' },
}

export const ROLES = {
  owner: '학회 Owner',
  ms_staff: 'MS Staff',
  ms_manager: 'MS Manager',
  agency: 'Agency',
  scm: 'SCM',
}

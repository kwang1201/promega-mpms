export const CONFERENCE_STATUS = {
  planning: { label: '기안준비', color: 'bg-gray-100 text-gray-700' },
  quotation: { label: '견적진행', color: 'bg-blue-100 text-blue-700' },
  production: { label: '제작중', color: 'bg-yellow-100 text-yellow-700' },
  review: { label: '리뷰중', color: 'bg-purple-100 text-purple-700' },
  final_prep: { label: '최종준비', color: 'bg-orange-100 text-orange-700' },
  completed: { label: '학회완료', color: 'bg-green-100 text-green-700' },
  settled: { label: '정산완료', color: 'bg-emerald-100 text-emerald-700' },
}

export const PROJECT_STATUS = {
  draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
  quotation: { label: '견적진행', color: 'bg-blue-100 text-blue-700' },
  in_production: { label: '제작중', color: 'bg-yellow-100 text-yellow-700' },
  in_review: { label: '리뷰중', color: 'bg-purple-100 text-purple-700' },
  approved: { label: '승인', color: 'bg-green-100 text-green-700' },
  final_prep: { label: '최종준비', color: 'bg-orange-100 text-orange-700' },
  completed: { label: '완료', color: 'bg-emerald-100 text-emerald-700' },
}

export const PROJECT_STATUS_ORDER = [
  'draft', 'quotation', 'in_production', 'in_review', 'approved', 'final_prep', 'completed'
]

export const TRACK_TYPES = {
  booth: { label: '부스/백월', icon: '🏗️' },
  banner: { label: '배너', icon: '🖼️' },
  giveaway: { label: '판촉물', icon: '🎁' },
  poster: { label: 'SCM 포스터', icon: '📄' },
  survey: { label: '설문/테이블텐트', icon: '📋' },
}

export const ROLES = {
  owner: '학회 오너',
  ms_staff: 'MS 담당자',
  ms_manager: 'MS 관리자',
  agency: '외주업체',
  scm: 'SCM',
}

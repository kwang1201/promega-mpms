// Role-based permission definitions
// owner: 학회 오너 - 요청 생성, 콘텐츠 제공, 리뷰
// ms_staff: MS 담당자 - 전체 관리, 외주 조율, 승인
// ms_manager: MS 관리자 - 최종 승인, 리포트, 예산, 유저 관리
// agency: 외주업체 - 할당 프로젝트만, 파일 업로드, 코멘트
// scm: SCM - 포스터 콘텐츠 제공

const PERMISSIONS = {
  // Conference
  'conference.create': ['owner', 'ms_staff', 'ms_manager'],
  'conference.edit': ['owner', 'ms_staff', 'ms_manager'],
  'conference.delete': ['ms_manager'],
  'conference.view': ['owner', 'ms_staff', 'ms_manager', 'agency', 'scm'],

  // Project
  'project.create': ['owner', 'ms_staff', 'ms_manager'],
  'project.edit': ['owner', 'ms_staff', 'ms_manager'],
  'project.delete': ['ms_manager'],
  'project.status_change': ['ms_staff', 'ms_manager'],

  // Review
  'review.create': ['owner', 'ms_staff', 'ms_manager'],
  'review.approve': ['owner', 'ms_staff', 'ms_manager'],

  // File
  'file.upload': ['owner', 'ms_staff', 'ms_manager', 'agency', 'scm'],
  'file.delete': ['ms_staff', 'ms_manager'],

  // Cost
  'cost.create': ['owner', 'ms_staff', 'ms_manager'],
  'cost.approve': ['ms_staff', 'ms_manager'],
  'cost.delete': ['ms_manager'],

  // Brand Assets
  'asset.upload': ['ms_staff', 'ms_manager'],
  'asset.delete': ['ms_staff', 'ms_manager'],

  // Admin
  'user.manage': ['ms_manager'],
  'agency.manage': ['ms_staff', 'ms_manager'],

  // Pages
  'page.conferences': ['owner', 'ms_staff', 'ms_manager', 'scm'],
  'page.requests': ['owner', 'ms_staff', 'ms_manager', 'scm'],
  'page.kanban': ['owner', 'ms_staff', 'ms_manager', 'agency', 'scm'],
  'page.gantt': ['owner', 'ms_staff', 'ms_manager'],
  'page.costs': ['ms_staff', 'ms_manager'],
  'page.brand_assets': ['owner', 'ms_staff', 'ms_manager', 'agency', 'scm'],
  'page.users': ['ms_manager'],
  'page.agencies': ['ms_staff', 'ms_manager'],
}

export function hasPermission(role, permission) {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role)
}

export function can(profile, permission) {
  if (!profile?.role) return false
  return hasPermission(profile.role, permission)
}

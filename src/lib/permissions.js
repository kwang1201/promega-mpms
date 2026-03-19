// Role-based permission definitions
// user: 요청자 - 요청 생성, 콘텐츠 제공, 리뷰
// ms_staff: MS 담당자 - 전체 관리, 외주 조율, 승인
// ms_manager: MS 관리자 - 최종 승인, 리포트, 예산, 유저 관리
// agency: 외주업체 - 할당 프로젝트만, 파일 업로드, 코멘트

const PERMISSIONS = {
  // Conference
  'conference.create': ['user', 'ms_staff', 'ms_manager'],
  'conference.edit': ['user', 'ms_staff', 'ms_manager'],
  'conference.delete': ['ms_manager'],
  'conference.view': ['user', 'ms_staff', 'ms_manager', 'agency'],

  // Project
  'project.create': ['user', 'ms_staff', 'ms_manager'],
  'project.edit': ['user', 'ms_staff', 'ms_manager'],
  'project.delete': ['ms_manager'],
  'project.status_change': ['ms_staff', 'ms_manager'],

  // Review
  'review.create': ['user', 'ms_staff', 'ms_manager'],
  'review.approve': ['user', 'ms_staff', 'ms_manager'],

  // File
  'file.upload': ['user', 'ms_staff', 'ms_manager', 'agency'],
  'file.delete': ['ms_staff', 'ms_manager'],

  // Cost
  'cost.create': ['user', 'ms_staff', 'ms_manager'],
  'cost.approve': ['ms_staff', 'ms_manager'],
  'cost.delete': ['ms_manager'],

  // Brand Assets
  'asset.upload': ['ms_staff', 'ms_manager'],
  'asset.delete': ['ms_staff', 'ms_manager'],

  // Admin
  'user.manage': ['ms_manager'],

  // Pages
  'page.conferences': ['user', 'ms_staff', 'ms_manager'],
  'page.requests': ['user', 'ms_staff', 'ms_manager'],
  'page.kanban': ['user', 'ms_staff', 'ms_manager', 'agency'],
  'page.gantt': ['user', 'ms_staff', 'ms_manager'],
  'page.costs': ['ms_staff', 'ms_manager'],
  'page.brand_assets': ['user', 'ms_staff', 'ms_manager', 'agency'],
  'page.users': ['ms_manager'],
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

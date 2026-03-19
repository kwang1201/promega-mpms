// Role-based permission definitions
// admin: 최고 관리자 - 모든 권한 + admin 역할 부여
// user: 요청자 - 요청 생성, 콘텐츠 제공, 리뷰
// ms_staff: MS 담당자 - 전체 관리, 외주 조율, 승인
// ms_manager: MS 관리자 - 최종 승인, 리포트, 예산, 유저 관리
// agency: 외주업체 - 할당 프로젝트만, 파일 업로드, 코멘트

const PERMISSIONS = {
  // Conference
  'conference.create': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'conference.edit': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'conference.delete': ['admin', 'ms_manager'],
  'conference.view': ['admin', 'user', 'ms_staff', 'ms_manager', 'agency'],

  // Project
  'project.create': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'project.edit': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'project.delete': ['admin', 'ms_manager'],
  'project.status_change': ['admin', 'ms_staff', 'ms_manager'],

  // Review
  'review.create': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'review.approve': ['admin', 'user', 'ms_staff', 'ms_manager'],

  // File
  'file.upload': ['admin', 'user', 'ms_staff', 'ms_manager', 'agency'],
  'file.delete': ['admin', 'ms_staff', 'ms_manager'],

  // Cost
  'cost.create': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'cost.approve': ['admin', 'ms_staff', 'ms_manager'],
  'cost.delete': ['admin', 'ms_manager'],

  // Brand Assets
  'asset.upload': ['admin', 'ms_staff', 'ms_manager'],
  'asset.delete': ['admin', 'ms_staff', 'ms_manager'],

  // Admin
  'user.manage': ['admin', 'ms_manager'],

  // Pages
  'page.conferences': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'page.requests': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'page.kanban': ['admin', 'user', 'ms_staff', 'ms_manager', 'agency'],
  'page.gantt': ['admin', 'user', 'ms_staff', 'ms_manager'],
  'page.costs': ['admin', 'ms_staff', 'ms_manager'],
  'page.brand_assets': ['admin', 'user', 'ms_staff', 'ms_manager', 'agency'],
  'page.users': ['admin', 'ms_manager'],
}

export function hasPermission(role, permission) {
  // Admin has all permissions
  if (role === 'admin') return true
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role)
}

export function can(profile, permission) {
  if (!profile?.role) return false
  return hasPermission(profile.role, permission)
}

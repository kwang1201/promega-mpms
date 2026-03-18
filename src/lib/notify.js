import { supabase } from '@/lib/supabase'

export async function createNotification({ userId, eventType, title, message, link }) {
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, event_type: eventType, title, message, link })
  if (error) console.error('Failed to create notification:', error)
}

export async function notifyProjectMembers({ projectId, excludeUserId, eventType, title, message, link }) {
  // Get project with conference owner
  const { data: project } = await supabase
    .from('projects')
    .select('assignee_id, agency_id, conference:conferences(owner_id)')
    .eq('id', projectId)
    .single()

  if (!project) return

  // Get MS staff/managers
  const { data: msUsers } = await supabase
    .from('users')
    .select('id')
    .in('role', ['ms_staff', 'ms_manager'])

  const recipientIds = new Set()

  // Conference owner
  if (project.conference?.owner_id) recipientIds.add(project.conference.owner_id)
  // Assignee
  if (project.assignee_id) recipientIds.add(project.assignee_id)
  // Agency users
  if (project.agency_id) {
    const { data: agencyUsers } = await supabase
      .from('users')
      .select('id')
      .eq('agency_id', project.agency_id)
    agencyUsers?.forEach(u => recipientIds.add(u.id))
  }
  // MS users
  msUsers?.forEach(u => recipientIds.add(u.id))

  // Remove the user who triggered the action
  if (excludeUserId) recipientIds.delete(excludeUserId)

  // Create notifications
  const notifications = Array.from(recipientIds).map(userId => ({
    user_id: userId,
    event_type: eventType,
    title,
    message,
    link,
  }))

  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) console.error('Failed to create notifications:', error)
  }
}

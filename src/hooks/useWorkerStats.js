import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useWorkerStats() {
  return useQuery({
    queryKey: ['worker_stats'],
    queryFn: async () => {
      // Fetch all projects with assignee info
      const { data: projects, error: projErr } = await supabase
        .from('projects')
        .select('id, status, assignee_id, agency_id, created_at, track_type, title')

      if (projErr) throw projErr

      // Fetch all activity logs for timing data
      const { data: activities, error: actErr } = await supabase
        .from('activity_log')
        .select('project_id, user_id, action, details, created_at')
        .in('action', ['status_change', 'submit_to_ms', 'complete_project'])

      if (actErr) throw actErr

      // Fetch review counts per project
      const { data: reviews, error: revErr } = await supabase
        .from('reviews')
        .select('project_id, round, review_phase')

      if (revErr) throw revErr

      // Fetch users (MS staff and agencies)
      const { data: users, error: usrErr } = await supabase
        .from('users')
        .select('id, name, role, company')
        .in('role', ['ms_staff', 'ms_manager', 'agency'])

      if (usrErr) throw usrErr

      // Compute stats per user
      const stats = users.map(user => {
        const assignedProjects = projects.filter(p =>
          p.assignee_id === user.id || p.agency_id === user.id
        )
        const completed = assignedProjects.filter(p => p.status === 'completed')
        const inProgress = assignedProjects.filter(p => p.status !== 'completed')

        // Average review rounds for assigned projects
        const projectIds = assignedProjects.map(p => p.id)
        const projectReviews = reviews.filter(r => projectIds.includes(r.project_id))
        const reviewsByProject = {}
        projectReviews.forEach(r => {
          if (!reviewsByProject[r.project_id]) reviewsByProject[r.project_id] = 0
          reviewsByProject[r.project_id] = Math.max(reviewsByProject[r.project_id], r.round)
        })
        const reviewCounts = Object.values(reviewsByProject)
        const avgReviewRounds = reviewCounts.length > 0
          ? (reviewCounts.reduce((a, b) => a + b, 0) / reviewCounts.length).toFixed(1)
          : '-'

        // Average completion days (from first activity to completion)
        let totalDays = 0
        let daysCount = 0
        completed.forEach(p => {
          const projActivities = activities.filter(a => a.project_id === p.id)
          if (projActivities.length >= 2) {
            const first = new Date(projActivities[projActivities.length - 1].created_at)
            const last = new Date(projActivities[0].created_at)
            const days = (last - first) / (1000 * 60 * 60 * 24)
            if (days > 0) {
              totalDays += days
              daysCount++
            }
          }
        })
        const avgDays = daysCount > 0 ? (totalDays / daysCount).toFixed(1) : '-'

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          company: user.company,
          totalProjects: assignedProjects.length,
          completed: completed.length,
          inProgress: inProgress.length,
          completionRate: assignedProjects.length > 0
            ? Math.round((completed.length / assignedProjects.length) * 100)
            : 0,
          avgReviewRounds,
          avgDays,
        }
      })

      return stats.filter(s => s.totalProjects > 0).sort((a, b) => b.totalProjects - a.totalProjects)
    },
    staleTime: 5 * 60 * 1000,
  })
}

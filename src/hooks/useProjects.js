import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const PROJECT_SELECT = '*, conference:conferences(name), assignee:users!assignee_id(name, email)'

// Helper to enrich projects with requester and agency info
async function enrichProjects(projects) {
  if (!projects || projects.length === 0) return projects

  // Collect unique requester_id and agency_id values
  const requesterIds = [...new Set(projects.map(p => p.requester_id).filter(Boolean))]
  const agencyIds = [...new Set(projects.map(p => p.agency_id).filter(Boolean))]
  const allIds = [...new Set([...requesterIds, ...agencyIds])]

  if (allIds.length === 0) return projects

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, company')
    .in('id', allIds)

  const userMap = {}
  users?.forEach(u => { userMap[u.id] = u })

  return projects.map(p => ({
    ...p,
    requester: p.requester_id ? userMap[p.requester_id] || null : null,
    assigned_agency: p.agency_id ? userMap[p.agency_id] || null : null,
  }))
}

export function useProjects(conferenceId) {
  return useQuery({
    queryKey: ['projects', { conferenceId }],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(PROJECT_SELECT)
        .order('created_at', { ascending: true })
      if (conferenceId) query = query.eq('conference_id', conferenceId)
      const { data, error } = await query
      if (error) throw error
      return enrichProjects(data)
    }
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_SELECT)
        .eq('id', id)
        .single()
      if (error) throw error
      const [enriched] = await enrichProjects([data])
      return enriched
    },
    enabled: !!id
  })
}

// Fetch agency users for assignment
export function useAgencyUsers() {
  return useQuery({
    queryKey: ['agency-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, company')
        .eq('role', 'agency')
        .order('name')
      if (error) throw error
      return data
    }
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (project) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] })
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  })
}

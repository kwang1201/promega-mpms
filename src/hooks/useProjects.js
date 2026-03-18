import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useProjects(conferenceId) {
  return useQuery({
    queryKey: ['projects', { conferenceId }],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*, conference:conferences(name), agency:agencies(name), assignee:users!assignee_id(name)')
        .order('created_at', { ascending: true })
      if (conferenceId) query = query.eq('conference_id', conferenceId)
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, conference:conferences(name), agency:agencies(name), assignee:users!assignee_id(name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id
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

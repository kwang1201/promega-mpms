import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useActivityLog(projectId) {
  return useQuery({
    queryKey: ['activity_log', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, user:users!user_id(name, email, role)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
    enabled: !!projectId,
  })
}

export function useLogActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, userId, action, details = {} }) => {
      const { error } = await supabase
        .from('activity_log')
        .insert({
          project_id: projectId,
          user_id: userId,
          action,
          details,
        })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activity_log', variables.projectId] })
    },
  })
}

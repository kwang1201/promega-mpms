import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useComments(projectId) {
  return useQuery({
    queryKey: ['comments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:users!author_id(name, role)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!projectId
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (comment) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select('*, author:users!author_id(name, role)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.project_id] })
    }
  })
}

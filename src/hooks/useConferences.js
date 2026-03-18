import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useConferences() {
  return useQuery({
    queryKey: ['conferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conferences')
        .select('*, owner:users!owner_id(name, email)')
        .order('date_start', { ascending: true })
      if (error) throw error
      return data
    }
  })
}

export function useConference(id) {
  return useQuery({
    queryKey: ['conferences', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conferences')
        .select('*, owner:users!owner_id(name, email)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateConference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conference) => {
      const { data, error } = await supabase
        .from('conferences')
        .insert(conference)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conferences'] })
  })
}

export function useUpdateConference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('conferences')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conferences'] })
      queryClient.invalidateQueries({ queryKey: ['conferences', data.id] })
    }
  })
}

export function useDeleteConference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('conferences').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conferences'] })
  })
}

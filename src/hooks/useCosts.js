import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCosts(conferenceId) {
  return useQuery({
    queryKey: ['costs', conferenceId],
    queryFn: async () => {
      let query = supabase
        .from('cost_items')
        .select('*, project:projects(title, track_type), approver:users!approved_by(name), creator:users!created_by(name)')
        .order('created_at', { ascending: false })
      if (conferenceId) query = query.eq('conference_id', conferenceId)
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useAllCosts() {
  return useQuery({
    queryKey: ['costs', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*, conference:conferences(name, budget), project:projects(title)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}

export function useCreateCost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cost) => {
      const { data, error } = await supabase
        .from('cost_items')
        .insert(cost)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['costs'] })
  })
}

export function useUpdateCost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('cost_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['costs'] })
  })
}

export function useDeleteCost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('cost_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['costs'] })
  })
}

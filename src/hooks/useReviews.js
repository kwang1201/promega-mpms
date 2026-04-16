import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useReviews(projectId, reviewPhase) {
  return useQuery({
    queryKey: ['reviews', projectId, reviewPhase],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*, reviewer:users!reviewer_id(name, email), file:files!file_id(original_name, version)')
        .eq('project_id', projectId)
      if (reviewPhase) query = query.eq('review_phase', reviewPhase)
      query = query.order('round', { ascending: true })
      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!projectId
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (review) => {
      // Get next round number (scoped to review_phase)
      let roundQuery = supabase
        .from('reviews')
        .select('round')
        .eq('project_id', review.project_id)
      if (review.review_phase) roundQuery = roundQuery.eq('review_phase', review.review_phase)
      const { data: existing } = await roundQuery
        .order('round', { ascending: false })
        .limit(1)
      const nextRound = existing?.length > 0 ? existing[0].round + 1 : 1

      const { data, error } = await supabase
        .from('reviews')
        .insert({ ...review, round: nextRound })
        .select('*, reviewer:users!reviewer_id(name)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select('*, reviewer:users!reviewer_id(name)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

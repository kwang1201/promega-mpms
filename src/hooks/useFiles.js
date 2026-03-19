import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useFiles(projectId) {
  return useQuery({
    queryKey: ['files', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*, uploader:users!uploader_id(name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!projectId
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ projectId, conferenceId, file }) => {
      // Get current max version for this filename in project
      const { data: existing } = await supabase
        .from('files')
        .select('version')
        .eq('project_id', projectId)
        .eq('original_name', file.name)
        .order('version', { ascending: false })
        .limit(1)

      const version = existing?.length > 0 ? existing[0].version + 1 : 1
      // Sanitize filename for storage (replace non-ASCII and special chars)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${conferenceId || 'requests'}/${projectId}/v${version}_${safeName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('marketing-files')
        .upload(storagePath, file)
      if (uploadError) throw uploadError

      // Insert file record
      const { data, error } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          filename: `v${version}_${safeName}`,
          original_name: file.name,
          version,
          file_size: file.size,
          mime_type: file.type,
          storage_path: storagePath,
          uploader_id: user.id
        })
        .select('*, uploader:users!uploader_id(name)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files', data.project_id] })
    }
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, storagePath, projectId }) => {
      // Delete from storage
      await supabase.storage.from('marketing-files').remove([storagePath])
      // Delete record
      const { error } = await supabase.from('files').delete().eq('id', id)
      if (error) throw error
      return { projectId }
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] })
    }
  })
}

export function getFileUrl(storagePath) {
  const { data } = supabase.storage.from('marketing-files').getPublicUrl(storagePath)
  return data.publicUrl
}

export function getSignedUrl(storagePath) {
  return supabase.storage.from('marketing-files').createSignedUrl(storagePath, 3600)
}

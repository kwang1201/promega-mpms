import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useBrandAssets(category) {
  return useQuery({
    queryKey: ['brand-assets', category],
    queryFn: async () => {
      let query = supabase
        .from('brand_assets')
        .select('*, uploader:users!uploaded_by(name)')
        .order('created_at', { ascending: false })
      if (category && category !== 'all') query = query.eq('category', category)
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useUploadBrandAsset() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ file, name, category, description }) => {
      const storagePath = `${category}/${Date.now()}_${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(storagePath, file)
      if (uploadError) throw uploadError

      const { data, error } = await supabase
        .from('brand_assets')
        .insert({
          name,
          category,
          description,
          file_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        })
        .select('*, uploader:users!uploaded_by(name)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brand-assets'] })
  })
}

export function useDeleteBrandAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, filePath }) => {
      if (filePath) {
        await supabase.storage.from('brand-assets').remove([filePath])
      }
      const { error } = await supabase.from('brand_assets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brand-assets'] })
  })
}

export function getBrandAssetUrl(filePath) {
  return supabase.storage.from('brand-assets').createSignedUrl(filePath, 3600)
}

// Archive released project files to brand assets
export async function archiveReleasedFiles({ projectId, projectTitle, trackType, userId }) {
  // Get all files from the project
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)

  if (filesError || !files?.length) return

  for (const file of files) {
    // Download from marketing-files bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('marketing-files')
      .download(file.storage_path)

    if (downloadError || !fileData) continue

    // Upload to brand-assets bucket
    const storagePath = `released/${trackType}/${Date.now()}_${file.original_name}`
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(storagePath, fileData)

    if (uploadError) continue

    // Create brand_assets record
    await supabase.from('brand_assets').insert({
      name: `[${projectTitle}] ${file.original_name}`,
      category: 'released',
      description: `Released from project: ${projectTitle} (${trackType})`,
      file_path: storagePath,
      file_size: file.file_size,
      mime_type: file.mime_type,
      uploaded_by: userId,
    })
  }
}

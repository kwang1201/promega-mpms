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
export async function archiveReleasedFiles({ projectId, projectTitle, trackType, userId, specificFiles }) {
  let filesToArchive = specificFiles

  if (!filesToArchive) {
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)

    if (filesError) { console.error('[Archive] Files fetch error:', filesError); return }
    if (!files?.length) { console.log('[Archive] No files to archive'); return }

    const skipKeywords = ['견적', 'quotation', 'invoice', '세금계산서', '계산서']
    const grouped = {}
    files.forEach(f => {
      if (f.file_category === 'quotation' || f.file_category === 'invoice') return
      const nameLower = (f.original_name || '').toLowerCase()
      if (skipKeywords.some(kw => nameLower.includes(kw))) return
      if (!grouped[f.original_name] || f.version > grouped[f.original_name].version) {
        grouped[f.original_name] = f
      }
    })
    filesToArchive = Object.values(grouped)
  }

  console.log('[Archive] Files to archive:', filesToArchive.length)

  for (const file of filesToArchive) {
    console.log('[Archive] Downloading:', file.storage_path)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('marketing-files')
      .download(file.storage_path)

    if (downloadError) { console.error('[Archive] Download error:', downloadError); continue }
    if (!fileData) { console.error('[Archive] No file data for:', file.storage_path); continue }

    const safeName = file.original_name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `released/${trackType}/${Date.now()}_${safeName}`
    console.log('[Archive] Uploading to:', storagePath)
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(storagePath, fileData)

    if (uploadError) { console.error('[Archive] Upload error:', uploadError); continue }

    const { error: insertError } = await supabase.from('brand_assets').insert({
      name: `[${projectTitle}] ${file.original_name}`,
      category: 'released',
      description: `Released from project: ${projectTitle} (${trackType})`,
      file_path: storagePath,
      file_size: file.file_size,
      mime_type: file.mime_type,
      uploaded_by: userId,
    })
    if (insertError) { console.error('[Archive] DB insert error:', insertError); continue }
    console.log('[Archive] Successfully archived:', file.original_name)
  }
}

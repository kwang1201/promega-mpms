import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Download, Trash2, FileIcon, Image, FileText, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getBrandAssetUrl } from '@/hooks/useBrandAssets'

const CATEGORY_LABELS = {
  logo: 'Logo',
  color: 'Color',
  template: 'Template',
  font: 'Font',
  guideline: 'Guideline',
  released: 'Released',
  other: 'Other',
}

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return Image
  if (mimeType?.includes('pdf')) return FileText
  return FileIcon
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AssetPreview({ asset, onClose }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    getBrandAssetUrl(asset.file_path).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl)
    })
  }, [asset.file_path])

  const isImage = asset.mime_type?.startsWith('image/')
  const isPdf = asset.mime_type?.includes('pdf')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{asset.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(asset.file_size)} • {asset.uploader?.name}</p>
          </div>
        </div>
        <div className="flex items-center justify-center bg-[#F1F1F1] min-h-[300px] max-h-[65vh] overflow-auto">
          {!url ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : isImage ? (
            <img src={url} alt={asset.name} className="max-w-full max-h-[65vh] object-contain" />
          ) : isPdf ? (
            <iframe src={url} className="w-full h-[65vh]" title={asset.name} />
          ) : (
            <div className="text-center py-12">
              <FileIcon className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">미리보기를 지원하지 않는 파일입니다</p>
              <Button size="sm" className="mt-3" onClick={() => window.open(url, '_blank')}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AssetThumbnail({ asset }) {
  const [thumbUrl, setThumbUrl] = useState(null)
  const isImage = asset.mime_type?.startsWith('image/')

  useEffect(() => {
    if (isImage) {
      getBrandAssetUrl(asset.file_path).then(({ data }) => {
        if (data?.signedUrl) setThumbUrl(data.signedUrl)
      })
    }
  }, [asset.file_path, isImage])

  const Icon = getFileIcon(asset.mime_type)

  if (isImage && thumbUrl) {
    return (
      <div className="h-28 bg-[#F1F1F1] rounded overflow-hidden flex items-center justify-center mb-3">
        <img src={thumbUrl} alt={asset.name} className="max-w-full max-h-28 object-contain" />
      </div>
    )
  }

  return (
    <div className="h-28 bg-[#F1F1F1] rounded flex items-center justify-center mb-3">
      <Icon className="h-10 w-10 text-[#515151]" />
    </div>
  )
}

export default function AssetGrid({ assets = [], onDelete, canManage }) {
  const [previewAsset, setPreviewAsset] = useState(null)

  async function handleDownload(asset) {
    const { data, error } = await getBrandAssetUrl(asset.file_path)
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  if (assets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        No assets in this category
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {assets.map(asset => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setPreviewAsset(asset)}>
            <CardContent className="pt-4">
              <AssetThumbnail asset={asset} />
              <div className="space-y-1">
                <p className="text-sm font-medium truncate" title={asset.name}>{asset.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[asset.category] || asset.category}</Badge>
                  {asset.file_size && (
                    <span className="text-[10px] text-muted-foreground">{formatSize(asset.file_size)}</span>
                  )}
                </div>
                {asset.description && (
                  <p className="text-xs text-muted-foreground truncate">{asset.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {asset.uploader?.name} | {format(new Date(asset.created_at), 'yyyy.MM.dd', { locale: ko })}
                </p>
              </div>
              <div className="flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 flex-1" onClick={() => handleDownload(asset)}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </Button>
                {canManage && onDelete && (
                  <Button variant="ghost" size="sm" className="h-7 text-red-500" onClick={() => onDelete(asset)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {previewAsset && (
        <AssetPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      )}
    </>
  )
}

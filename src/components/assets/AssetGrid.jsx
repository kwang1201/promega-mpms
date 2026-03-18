import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Download, Trash2, FileIcon, Image, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getBrandAssetUrl } from '@/hooks/useBrandAssets'

const CATEGORY_LABELS = {
  logo: 'Logo',
  color: 'Color',
  template: 'Template',
  font: 'Font',
  guideline: 'Guideline',
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

export default function AssetGrid({ assets = [], onDelete, canManage }) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {assets.map(asset => {
        const Icon = getFileIcon(asset.mime_type)
        return (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              {/* Icon / Preview */}
              <div className="h-24 bg-[#F1F1F1] rounded flex items-center justify-center mb-3">
                <Icon className="h-10 w-10 text-[#515151]" />
              </div>
              {/* Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium truncate" title={asset.name}>{asset.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[asset.category]}</Badge>
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
              {/* Actions */}
              <div className="flex gap-1 mt-2">
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
        )
      })}
    </div>
  )
}

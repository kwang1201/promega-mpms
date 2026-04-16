import { useState } from 'react'
import { Plus, Search, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import AssetGrid from '@/components/assets/AssetGrid'
import AssetUploadForm from '@/components/assets/AssetUploadForm'
import { useBrandAssets, useUploadBrandAsset, useDeleteBrandAsset } from '@/hooks/useBrandAssets'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'logo', label: 'Logo' },
  { value: 'color', label: 'Color' },
  { value: 'template', label: 'Template' },
  { value: 'font', label: 'Font' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'released', label: 'Released Files' },
  { value: 'other', label: 'Other' },
]

const DAM_LINKS = [
  { label: 'Brand Guidelines', description: 'Promega brand standards, logo usage, and style guides', url: 'https://promega.widencollective.com/portals/brand-guidelines' },
  { label: 'Promega Imagery', description: 'Product photos, lifestyle images, and illustrations', url: 'https://promega.widencollective.com/portals/promega-imagery' },
  { label: 'Goodsell Imagery', description: 'David Goodsell scientific illustrations', url: 'https://promega.widencollective.com/portals/goodsell-imagery' },
  { label: 'Templates', description: 'PowerPoint, Word, and print templates', url: 'https://promega.widencollective.com/portals/templates' },
]

export default function BrandAssetsPage() {
  const { profile } = useAuth()
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const { data: assets = [], isLoading } = useBrandAssets(category)
  const uploadAsset = useUploadBrandAsset()
  const deleteAsset = useDeleteBrandAsset()

  const canManage = ['admin', 'ms_staff', 'ms_manager'].includes(profile?.role)

  const filtered = search
    ? assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    : assets

  async function handleUpload({ file, name, category, description }) {
    await uploadAsset.mutateAsync({ file, name, category, description })
  }

  async function handleDelete(asset) {
    if (confirm(`Delete "${asset.name}"?`)) {
      await deleteAsset.mutateAsync({ id: asset.id, filePath: asset.file_path })
    }
  }

  return (
    <>
      <Header title="Brand Assets">
        {canManage && (
          <Button size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={() => setShowUpload(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Upload Asset
          </Button>
        )}
      </Header>
      <div className="p-6 space-y-6">
        {/* DAM Portal Links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Promega DAM (Widen Collective)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DAM_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                >
                  <span className="text-sm font-medium group-hover:text-[#199AC2] flex items-center gap-1">
                    {link.label}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-xs text-muted-foreground">{link.description}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="mb-4 flex-wrap">
            {CATEGORIES.map(c => (
              <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map(c => (
            <TabsContent key={c.value} value={c.value}>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <AssetGrid
                  assets={filtered}
                  onDelete={handleDelete}
                  canManage={canManage}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <AssetUploadForm
        open={showUpload}
        onOpenChange={setShowUpload}
        onSubmit={handleUpload}
        loading={uploadAsset.isPending}
      />
    </>
  )
}

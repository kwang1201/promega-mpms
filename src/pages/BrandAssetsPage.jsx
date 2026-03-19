import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
      <div className="p-6 space-y-4">
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

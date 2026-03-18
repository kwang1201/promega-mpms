import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const CATEGORIES = [
  { value: 'logo', label: 'Logo' },
  { value: 'color', label: 'Color Palette' },
  { value: 'template', label: 'Template' },
  { value: 'font', label: 'Font' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'other', label: 'Other' },
]

export default function AssetUploadForm({ open, onOpenChange, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    category: 'logo',
    description: '',
    file: null,
  })

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.file) return
    await onSubmit(form)
    onOpenChange(false)
    setForm({ name: '', category: 'logo', description: '', file: null })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Brand Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Name *</Label>
            <Input id="asset-name" value={form.name} onChange={e => handleChange('name', e.target.value)} required placeholder="e.g. Promega Logo Vertical Sol" />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => handleChange('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-desc">Description</Label>
            <Textarea id="asset-desc" value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>File *</Label>
            <Input type="file" onChange={e => handleChange('file', e.target.files[0])} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#13294B] hover:bg-[#13294B]/90" disabled={loading || !form.file}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

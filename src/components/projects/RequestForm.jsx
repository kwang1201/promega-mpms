import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { TRACK_TYPES } from '@/lib/constants'
import TypeSpecificFields from './TypeSpecificFields'

export default function RequestForm({ open, onOpenChange, onSubmit }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    track_type: 'brochure',
    title: '',
    deadline: '',
    description: '',
  })
  const [typeMetadata, setTypeMetadata] = useState({})

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'track_type') setTypeMetadata({})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({
      ...form,
      conference_id: null,
      request_type: 'independent',
      requester_id: user.id,
      type_metadata: typeMetadata,
    })
    onOpenChange(false)
    setForm({ track_type: 'brochure', title: '', deadline: '', description: '' })
    setTypeMetadata({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={form.track_type} onValueChange={v => handleChange('track_type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRACK_TYPES).map(([key, { label, icon }]) => (
                  <SelectItem key={key} value={key}>{icon} {label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-title">Title *</Label>
            <Input id="req-title" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Product Brochure 2026" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-deadline">Deadline</Label>
            <Input id="req-deadline" type="date" value={form.deadline} onChange={e => handleChange('deadline', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-desc">Description</Label>
            <Textarea id="req-desc" value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2} placeholder="Describe what you need..." />
          </div>

          {/* Type-specific fields */}
          <TypeSpecificFields
            trackType={form.track_type}
            metadata={typeMetadata}
            onChange={setTypeMetadata}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#13294B] hover:bg-[#13294B]/90">Submit Request</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

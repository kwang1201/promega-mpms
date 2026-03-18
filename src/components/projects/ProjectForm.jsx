import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TRACK_TYPES } from '@/lib/constants'

export default function ProjectForm({ open, onOpenChange, onSubmit, conferenceId, initialData }) {
  const [form, setForm] = useState(initialData || {
    track_type: 'booth',
    title: '',
    deadline: '',
    description: '',
  })

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({
      ...form,
      conference_id: conferenceId,
    })
    onOpenChange(false)
    if (!initialData) {
      setForm({ track_type: 'booth', title: '', deadline: '', description: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? '프로젝트 수정' : '새 프로젝트 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>트랙 유형 *</Label>
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
            <Label htmlFor="title">프로젝트명 *</Label>
            <Input id="title" value={form.title} onChange={e => handleChange('title', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">마감일</Label>
            <Input id="deadline" type="date" value={form.deadline} onChange={e => handleChange('deadline', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-desc">설명</Label>
            <Textarea id="proj-desc" value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit">{initialData ? '수정' : '추가'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

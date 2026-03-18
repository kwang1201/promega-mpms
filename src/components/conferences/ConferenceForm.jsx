import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'

export default function ConferenceForm({ open, onOpenChange, onSubmit, initialData }) {
  const { user } = useAuth()
  const [form, setForm] = useState(initialData || {
    name: '',
    date_start: '',
    date_end: '',
    location: '',
    budget: '',
    description: '',
  })

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({
      ...form,
      budget: form.budget ? Number(form.budget) : 0,
      owner_id: initialData?.owner_id || user.id,
    })
    onOpenChange(false)
    if (!initialData) {
      setForm({ name: '', date_start: '', date_end: '', location: '', budget: '', description: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? '학회 수정' : '새 학회 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">학회명 *</Label>
            <Input id="name" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_start">시작일 *</Label>
              <Input id="date_start" type="date" value={form.date_start} onChange={e => handleChange('date_start', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_end">종료일 *</Label>
              <Input id="date_end" type="date" value={form.date_end} onChange={e => handleChange('date_end', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">장소</Label>
            <Input id="location" value={form.location} onChange={e => handleChange('location', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">예산 (원)</Label>
            <Input id="budget" type="number" value={form.budget} onChange={e => handleChange('budget', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea id="description" value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit">{initialData ? '수정' : '등록'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

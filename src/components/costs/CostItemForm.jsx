import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'

const COST_TYPES = [
  { value: 'quotation', label: 'Quotation (견적서)' },
  { value: 'invoice', label: 'Invoice (계산서)' },
  { value: 'other', label: 'Other' },
]

export default function CostItemForm({ open, onOpenChange, onSubmit, conferenceId, projects = [] }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    type: 'quotation',
    description: '',
    vendor: '',
    amount: '',
    project_id: '',
  })

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({
      ...form,
      amount: Number(form.amount) || 0,
      project_id: form.project_id || null,
      conference_id: conferenceId,
      created_by: user.id,
    })
    onOpenChange(false)
    setForm({ type: 'quotation', description: '', vendor: '', amount: '', project_id: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Cost Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => handleChange('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COST_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={form.project_id} onValueChange={v => handleChange('project_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost-desc">Description *</Label>
            <Textarea id="cost-desc" value={form.description} onChange={e => handleChange('description', e.target.value)} required rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" value={form.vendor} onChange={e => handleChange('vendor', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₩) *</Label>
              <Input id="amount" type="number" value={form.amount} onChange={e => handleChange('amount', e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#13294B] hover:bg-[#13294B]/90">Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

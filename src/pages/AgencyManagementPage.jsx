import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, Building, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/ui/EmptyState'
import { useAgencies, useCreateAgency, useUpdateAgency, useDeleteAgency } from '@/hooks/useUsers'

export default function AgencyManagementPage() {
  const { data: agencies = [], isLoading } = useAgencies()
  const createAgency = useCreateAgency()
  const updateAgency = useUpdateAgency()
  const deleteAgency = useDeleteAgency()
  const [showForm, setShowForm] = useState(false)
  const [editingAgency, setEditingAgency] = useState(null)
  const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', specialty: '' })

  function openCreate() {
    setEditingAgency(null)
    setForm({ name: '', contact_person: '', email: '', phone: '', specialty: '' })
    setShowForm(true)
  }

  function openEdit(agency) {
    setEditingAgency(agency)
    setForm({
      name: agency.name || '',
      contact_person: agency.contact_person || '',
      email: agency.email || '',
      phone: agency.phone || '',
      specialty: agency.specialty || '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingAgency) {
      await updateAgency.mutateAsync({ id: editingAgency.id, ...form })
      toast.success('Agency updated')
    } else {
      await createAgency.mutateAsync(form)
      toast.success('Agency created')
    }
    setShowForm(false)
  }

  async function handleDelete(agency) {
    if (confirm(`Delete "${agency.name}"?`)) {
      await deleteAgency.mutateAsync(agency.id)
      toast.success('Agency deleted')
    }
  }

  return (
    <>
      <Header title="Agency Management" breadcrumbs={[{ label: 'Agency Management' }]}>
        <Button size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New Agency
        </Button>
      </Header>
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : agencies.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No agencies registered"
            description="Add agencies to assign them to projects"
            action={openCreate}
            actionLabel="New Agency"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {agencies.map(agency => (
              <Card key={agency.id} className="card-hover">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-[#713A61]/10 text-[#713A61] flex items-center justify-center text-sm font-bold">
                        {agency.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{agency.name}</p>
                        {agency.specialty && (
                          <Badge variant="outline" className="text-[10px] mt-0.5">{agency.specialty}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(agency)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(agency)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {agency.contact_person && (
                      <p>Contact: {agency.contact_person}</p>
                    )}
                    {agency.email && (
                      <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{agency.email}</p>
                    )}
                    {agency.phone && (
                      <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{agency.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAgency ? 'Edit Agency' : 'New Agency'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agency-name">Name *</Label>
              <Input id="agency-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Design, Print" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency-email">Email</Label>
                <Input id="agency-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-phone">Phone</Label>
                <Input id="agency-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#13294B] hover:bg-[#13294B]/90">
                {editingAgency ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

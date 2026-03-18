import { useState, useMemo } from 'react'
import { Plus, Building2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/ui/EmptyState'
import ConferenceCard from '@/components/conferences/ConferenceCard'
import ConferenceForm from '@/components/conferences/ConferenceForm'
import { useConferences, useCreateConference } from '@/hooks/useConferences'
import { CONFERENCE_STATUS } from '@/lib/constants'

export default function ConferencesPage() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const { data: conferences, isLoading } = useConferences()
  const createConference = useCreateConference()

  const years = useMemo(() => {
    if (!conferences) return []
    const yearSet = new Set(conferences.map(c => new Date(c.date_start).getFullYear()))
    return [...yearSet].sort((a, b) => b - a)
  }, [conferences])

  const filtered = useMemo(() => {
    if (!conferences) return []
    return conferences.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (filterYear !== 'all' && new Date(c.date_start).getFullYear() !== Number(filterYear)) return false
      return true
    })
  }, [conferences, search, filterStatus, filterYear])

  async function handleCreate(data) {
    await createConference.mutateAsync(data)
    toast.success('Conference created successfully')
  }

  return (
    <>
      <Header title="Conferences">
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90">
          <Plus className="h-4 w-4 mr-1" />
          New Conference
        </Button>
      </Header>
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conferences..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(CONFERENCE_STATUS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={conferences?.length === 0 ? "No conferences registered" : "No matching conferences"}
            description={conferences?.length === 0
              ? "Create a new conference to start managing your exhibition projects"
              : "Try adjusting your filters"
            }
            action={conferences?.length === 0 ? () => setShowForm(true) : undefined}
            actionLabel="New Conference"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filtered.map(conf => (
              <ConferenceCard key={conf.id} conference={conf} />
            ))}
          </div>
        )}
      </div>
      <ConferenceForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleCreate}
      />
    </>
  )
}

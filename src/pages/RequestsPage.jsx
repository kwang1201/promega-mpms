import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/layout/Header'
import { useProjects, useCreateProject } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'
import { PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'
import RequestForm from '@/components/projects/RequestForm'

export default function RequestsPage() {
  const { data: allProjects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTrack, setFilterTrack] = useState('all')

  const requests = useMemo(() => {
    const base = allProjects.filter(p => p.request_type === 'independent' || !p.conference_id)
    return base.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== 'all' && r.status !== filterStatus) return false
      if (filterTrack !== 'all' && r.track_type !== filterTrack) return false
      return true
    })
  }, [allProjects, search, filterStatus, filterTrack])

  return (
    <>
      <Header title="Requests">
        <Button size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Request
        </Button>
      </Header>
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTrack} onValueChange={setFilterTrack}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              {Object.entries(TRACK_TYPES).map(([key, { label, icon }]) => (
                <SelectItem key={key} value={key}>{icon} {label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No matching requests</p>
            <p className="text-sm">Create a new request for brochures, prints, or other materials</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const status = PROJECT_STATUS[req.status]
              const track = TRACK_TYPES[req.track_type]
              return (
                <Link key={req.id} to={`/projects/${req.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{track?.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{req.title}</span>
                            <Badge variant="secondary" className={`text-xs ${status?.color}`}>
                              {status?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{track?.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {req.description && `${req.description.slice(0, 80)}${req.description.length > 80 ? '...' : ''}`}
                          </p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            {req.requester && <span>Requester: {req.requester.name}</span>}
                            {req.deadline && <span>Due: {format(new Date(req.deadline), 'yyyy.MM.dd', { locale: ko })}</span>}
                            {req.assignee && <span>Assignee: {req.assignee.name}</span>}
                            {req.assigned_agency && <span>Agency: {req.assigned_agency.name}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <RequestForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(data) => createProject.mutateAsync(data)}
      />
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import { useProjects, useCreateProject } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'
import { PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'
import RequestForm from '@/components/projects/RequestForm'

export default function RequestsPage() {
  const { data: allProjects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const [showForm, setShowForm] = useState(false)

  // Filter independent requests (no conference)
  const requests = allProjects.filter(p => p.request_type === 'independent' || !p.conference_id)

  return (
    <>
      <Header title="Requests">
        <Button size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Request
        </Button>
      </Header>
      <div className="p-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No independent requests</p>
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
                            {req.deadline && <span>Due: {format(new Date(req.deadline), 'yyyy.MM.dd', { locale: ko })}</span>}
                            {req.assignee && <span>Assignee: {req.assignee.name}</span>}
                            {req.agency && <span>Agency: {req.agency.name}</span>}
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

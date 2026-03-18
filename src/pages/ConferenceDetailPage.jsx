import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, ArrowLeft, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/layout/Header'
import ProjectForm from '@/components/projects/ProjectForm'
import ConferenceForm from '@/components/conferences/ConferenceForm'
import CostSummary from '@/components/costs/CostSummary'
import TrackTimeline from '@/components/timeline/TrackTimeline'
import { useConference, useUpdateConference } from '@/hooks/useConferences'
import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/useProjects'
import { useCosts } from '@/hooks/useCosts'
import { CONFERENCE_STATUS, PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'

export default function ConferenceDetailPage() {
  const { id } = useParams()
  const { data: conference, isLoading: confLoading } = useConference(id)
  const { data: projects, isLoading: projLoading } = useProjects(id)
  const { data: costs = [] } = useCosts(id)
  const updateConference = useUpdateConference()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  if (confLoading) return <div className="p-6 text-muted-foreground">Loading...</div>
  if (!conference) return <div className="p-6 text-muted-foreground">Conference not found</div>

  const status = CONFERENCE_STATUS[conference.status]

  // Group projects by track type
  const trackGroups = Object.keys(TRACK_TYPES).map(type => ({
    type,
    ...TRACK_TYPES[type],
    projects: projects?.filter(p => p.track_type === type) || []
  }))

  return (
    <>
      <Header title={conference.name}>
        <Link to="/conferences">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            List
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </Header>
      <div className="p-6 space-y-6">
        {/* Conference Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge className={status?.color}>{status?.label}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Date: </span>
                {format(new Date(conference.date_start), 'yyyy.MM.dd', { locale: ko })}
                {' - '}
                {format(new Date(conference.date_end), 'MM.dd', { locale: ko })}
              </div>
              {conference.location && (
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  {conference.location}
                </div>
              )}
              {conference.owner && (
                <div>
                  <span className="text-muted-foreground">Owner: </span>
                  {conference.owner.name}
                </div>
              )}
              {conference.budget > 0 && (
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  ₩{Number(conference.budget).toLocaleString()}
                </div>
              )}
            </div>
            {conference.description && (
              <p className="mt-3 text-sm text-muted-foreground">{conference.description}</p>
            )}
            <div className="mt-4">
              <Select
                value={conference.status}
                onValueChange={(v) => updateConference.mutate({ id: conference.id, status: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONFERENCE_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <CostSummary budget={Number(conference.budget || 0)} costs={costs} />

        {/* Track Timeline */}
        <TrackTimeline
          projects={projects || []}
          conferenceStart={conference.date_start}
          conferenceEnd={conference.date_end}
        />

        {/* Track Progress */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Parallel Tracks</h3>
          <Button size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={() => setShowProjectForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        </div>

        {projLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackGroups.map(group => (
              <Card key={group.type}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span>{group.icon}</span>
                    {group.label}
                    <Badge variant="outline" className="ml-auto">{group.projects.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.projects.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No projects</p>
                  ) : (
                    group.projects.map(project => {
                      const pStatus = PROJECT_STATUS[project.status]
                      return (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}`}
                          className="block p-2 rounded border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm truncate">{project.title}</span>
                            <Badge variant="secondary" className={`shrink-0 text-xs ${pStatus?.color}`}>
                              {pStatus?.label}
                            </Badge>
                          </div>
                          {project.deadline && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {format(new Date(project.deadline), 'MM.dd', { locale: ko })}
                            </p>
                          )}
                        </Link>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjectForm
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        conferenceId={id}
        onSubmit={(data) => createProject.mutateAsync(data)}
      />
      {showEditForm && (
        <ConferenceForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          initialData={{
            ...conference,
            budget: conference.budget?.toString() || '',
          }}
          onSubmit={(data) => updateConference.mutateAsync({ id: conference.id, ...data })}
        />
      )}
    </>
  )
}

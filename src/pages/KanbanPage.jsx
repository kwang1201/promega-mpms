import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/layout/Header'
import { useProjects, useUpdateProject } from '@/hooks/useProjects'
import { useConferences } from '@/hooks/useConferences'
import { PROJECT_STATUS, PROJECT_STATUS_ORDER, TRACK_TYPES } from '@/lib/constants'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function KanbanPage() {
  const { data: projects, isLoading } = useProjects()
  const { data: conferences } = useConferences()
  const updateProject = useUpdateProject()
  const [filterConference, setFilterConference] = useState('all')
  const [filterTrack, setFilterTrack] = useState('all')
  const [draggedId, setDraggedId] = useState(null)

  const filtered = projects?.filter(p => {
    if (filterConference !== 'all' && p.conference_id !== filterConference) return false
    if (filterTrack !== 'all' && p.track_type !== filterTrack) return false
    return true
  }) || []

  function handleDragStart(e, projectId) {
    setDraggedId(projectId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, newStatus) {
    e.preventDefault()
    if (draggedId) {
      updateProject.mutate({ id: draggedId, status: newStatus })
      setDraggedId(null)
    }
  }

  return (
    <>
      <Header title="칸반 보드">
        <Select value={filterConference} onValueChange={setFilterConference}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="학회 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 학회</SelectItem>
            {conferences?.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTrack} onValueChange={setFilterTrack}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="트랙 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 트랙</SelectItem>
            {Object.entries(TRACK_TYPES).map(([key, { label, icon }]) => (
              <SelectItem key={key} value={key}>{icon} {label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Header>
      <div className="p-4 overflow-x-auto">
        {isLoading ? (
          <p className="text-muted-foreground p-4">로딩 중...</p>
        ) : (
          <div className="flex gap-3 min-w-max">
            {PROJECT_STATUS_ORDER.map(statusKey => {
              const statusInfo = PROJECT_STATUS[statusKey]
              const columnProjects = filtered.filter(p => p.status === statusKey)
              return (
                <div
                  key={statusKey}
                  className="w-64 shrink-0"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, statusKey)}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{columnProjects.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                    {columnProjects.map(project => {
                      const track = TRACK_TYPES[project.track_type]
                      return (
                        <Card
                          key={project.id}
                          draggable
                          onDragStart={e => handleDragStart(e, project.id)}
                          className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${
                            draggedId === project.id ? 'opacity-50' : ''
                          }`}
                        >
                          <Link to={`/projects/${project.id}`} className="block">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs">{track?.icon}</span>
                              <span className="text-xs text-muted-foreground">{track?.label}</span>
                            </div>
                            <p className="text-sm font-medium truncate">{project.title}</p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {project.conference?.name}
                            </p>
                            {project.deadline && (
                              <p className="text-xs text-muted-foreground mt-1">
                                마감: {format(new Date(project.deadline), 'MM.dd', { locale: ko })}
                              </p>
                            )}
                          </Link>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

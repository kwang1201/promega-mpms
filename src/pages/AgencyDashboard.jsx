import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, Upload, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Header from '@/components/layout/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import { PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'

export default function AgencyDashboard() {
  const { profile } = useAuth()
  const { data: allProjects, isLoading } = useProjects()

  // Agency sees only projects assigned to their agency
  const projects = allProjects?.filter(p => p.agency_id === profile?.agency_id) || []
  const inProgress = projects.filter(p => !['completed'].includes(p.status))
  const completed = projects.filter(p => p.status === 'completed')

  return (
    <>
      <Header title={`Welcome, ${profile?.name || 'Agency'}`} />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#FDB813]/15">
                      <FolderKanban className="h-5 w-5 text-[#946d00]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{inProgress.length}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#13294B]/10">
                      <Upload className="h-5 w-5 text-[#13294B]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{projects.length}</p>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#199AC2]/10">
                      <MessageSquare className="h-5 w-5 text-[#199AC2]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completed.length}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assigned Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No projects assigned yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projects.map(project => {
                      const status = PROJECT_STATUS[project.status]
                      const track = TRACK_TYPES[project.track_type]
                      return (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{track?.icon}</span>
                              <span className="font-medium text-sm">{project.title}</span>
                              <Badge variant="secondary" className={`text-xs ${status?.color}`}>
                                {status?.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {project.conference?.name}
                              {project.deadline && ` | Due: ${format(new Date(project.deadline), 'MM.dd', { locale: ko })}`}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}

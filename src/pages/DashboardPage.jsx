import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, FolderKanban, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useConferences } from '@/hooks/useConferences'
import { useProjects } from '@/hooks/useProjects'
import { CONFERENCE_STATUS, PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import { format, isPast, addDays, isAfter } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data: conferences, isLoading: confLoading } = useConferences()
  const { data: projects, isLoading: projLoading } = useProjects()

  const activeConferences = conferences?.filter(c => !['completed', 'settled'].includes(c.status)) || []
  const totalProjects = projects?.length || 0
  const inProgressProjects = projects?.filter(p => !['completed'].includes(p.status)).length || 0
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0

  // Overdue / upcoming deadline projects
  const now = new Date()
  const overdueProjects = projects?.filter(p =>
    p.deadline && isPast(new Date(p.deadline)) && p.status !== 'completed'
  ) || []
  const upcomingProjects = projects?.filter(p =>
    p.deadline && !isPast(new Date(p.deadline)) && isAfter(addDays(now, 3), new Date(p.deadline)) && p.status !== 'completed'
  ) || []

  const isLoading = confLoading || projLoading

  return (
    <>
      <Header title={`Welcome, ${profile?.name || 'User'}`} />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#199AC2]/10">
                      <Building2 className="h-5 w-5 text-[#199AC2]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{activeConferences.length}</p>
                      <p className="text-sm text-muted-foreground">Active Conferences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#FDB813]/15">
                      <FolderKanban className="h-5 w-5 text-[#946d00]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{inProgressProjects}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#13294B]/10">
                      <CheckCircle2 className="h-5 w-5 text-[#13294B]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedProjects}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overdueProjects.length}</p>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(overdueProjects.length > 0 || upcomingProjects.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overdueProjects.map(p => (
                    <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-3 p-2 rounded hover:bg-accent/50">
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                      <span className="text-sm">{p.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Due: {format(new Date(p.deadline), 'MM.dd', { locale: ko })}
                      </span>
                    </Link>
                  ))}
                  {upcomingProjects.map(p => (
                    <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-3 p-2 rounded hover:bg-accent/50">
                      <Badge className="bg-[#FDB813]/20 text-[#946d00] text-xs">Due Soon</Badge>
                      <span className="text-sm">{p.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Due: {format(new Date(p.deadline), 'MM.dd', { locale: ko })}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Active Conferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Conferences</CardTitle>
              </CardHeader>
              <CardContent>
                {activeConferences.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active conferences</p>
                ) : (
                  <div className="space-y-3">
                    {activeConferences.map(conf => {
                      const confProjects = projects?.filter(p => p.conference_id === conf.id) || []
                      const confStatus = CONFERENCE_STATUS[conf.status]
                      return (
                        <Link
                          key={conf.id}
                          to={`/conferences/${conf.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{conf.name}</span>
                              <Badge variant="secondary" className={`text-xs ${confStatus?.color}`}>
                                {confStatus?.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(conf.date_start), 'yyyy.MM.dd', { locale: ko })}
                              {conf.location && ` | ${conf.location}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{confProjects.length} Tracks</p>
                            <p className="text-xs text-muted-foreground">
                              {confProjects.filter(p => p.status === 'completed').length} Completed
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

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import GanttChart from '@/components/gantt/GanttChart'
import { useConferences } from '@/hooks/useConferences'
import { useProjects } from '@/hooks/useProjects'

export default function GanttPage() {
  const { data: conferences = [] } = useConferences()
  const { data: allProjects = [], isLoading } = useProjects()
  const [selectedConference, setSelectedConference] = useState('all')

  const filtered = selectedConference === 'all'
    ? allProjects.filter(p => p.deadline)
    : allProjects.filter(p => p.conference_id === selectedConference && p.deadline)

  // Calculate date range
  const conference = conferences.find(c => c.id === selectedConference)
  let startDate, endDate

  if (conference) {
    startDate = conference.date_start
    endDate = conference.date_end
  } else if (filtered.length > 0) {
    const dates = filtered.flatMap(p => [
      new Date(p.created_at),
      p.deadline ? new Date(p.deadline) : new Date()
    ])
    startDate = new Date(Math.min(...dates)).toISOString().split('T')[0]
    const maxDate = new Date(Math.max(...dates))
    maxDate.setDate(maxDate.getDate() + 7)
    endDate = maxDate.toISOString().split('T')[0]
  } else {
    const now = new Date()
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().split('T')[0]
  }

  return (
    <>
      <Header title="Gantt Chart">
        <Select value={selectedConference} onValueChange={setSelectedConference}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select conference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {conferences.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Header>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Project Timeline
              <span className="text-xs text-muted-foreground font-normal ml-2">
                ({filtered.length} projects)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <GanttChart
                projects={filtered}
                startDate={startDate}
                endDate={endDate}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

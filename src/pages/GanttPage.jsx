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
              <GanttChart projects={filtered} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

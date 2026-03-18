import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AgencyStats({ projects = [], reviews = [] }) {
  // Group by agency
  const agencyMap = {}
  projects.forEach(p => {
    if (!p.agency) return
    const name = p.agency.name
    if (!agencyMap[name]) {
      agencyMap[name] = { name, total: 0, completed: 0, onTime: 0, reviewRounds: 0 }
    }
    agencyMap[name].total++
    if (p.status === 'completed') {
      agencyMap[name].completed++
      if (p.deadline && new Date(p.updated_at) <= new Date(p.deadline)) {
        agencyMap[name].onTime++
      }
    }
  })

  // Count review rounds per agency (via project)
  reviews.forEach(r => {
    const project = projects.find(p => p.id === r.project_id)
    if (project?.agency?.name && agencyMap[project.agency.name]) {
      agencyMap[project.agency.name].reviewRounds++
    }
  })

  const agencies = Object.values(agencyMap)

  if (agencies.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Agency Performance</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No agency data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Agency Performance</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agencies.map(a => {
            const onTimeRate = a.completed > 0 ? Math.round((a.onTime / a.completed) * 100) : 0
            const avgReviews = a.total > 0 ? (a.reviewRounds / a.total).toFixed(1) : 0
            return (
              <div key={a.name} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="h-9 w-9 rounded-full bg-[#713A61]/10 text-[#713A61] flex items-center justify-center text-sm font-bold">
                  {a.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.total} projects | {a.completed} completed</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    On-time: {onTimeRate}%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Avg Reviews: {avgReviews}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

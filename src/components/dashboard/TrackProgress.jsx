import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TRACK_TYPES } from '@/lib/constants'

export default function TrackProgress({ projects = [] }) {
  const tracks = Object.entries(TRACK_TYPES).map(([key, { label, icon }]) => {
    const trackProjects = projects.filter(p => p.track_type === key)
    const total = trackProjects.length
    const completed = trackProjects.filter(p => p.status === 'completed').length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { key, label, icon, total, completed, percent }
  }).filter(t => t.total > 0)

  if (tracks.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Track Progress</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No tracks in progress</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Track Progress</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {tracks.map(t => (
          <div key={t.key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5">
                <span>{t.icon}</span>
                <span className="font-medium">{t.label}</span>
              </span>
              <span className="text-muted-foreground">{t.completed}/{t.total}</span>
            </div>
            <div className="h-2.5 bg-[#EBE7E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#455DA0] rounded-full transition-all"
                style={{ width: `${t.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

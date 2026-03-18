import { differenceInDays, startOfDay, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TRACK_TYPES, PROJECT_STATUS } from '@/lib/constants'

const TRACK_COLORS = {
  booth: '#13294B',
  banner: '#455DA0',
  giveaway: '#FDB813',
  poster: '#199AC2',
  survey: '#713A61',
  print: '#515151',
}

export default function TrackTimeline({ projects = [], conferenceStart, conferenceEnd }) {
  if (!conferenceStart || !conferenceEnd) return null

  const start = startOfDay(new Date(conferenceStart))
  const end = startOfDay(new Date(conferenceEnd))
  const totalDays = differenceInDays(end, start) + 1
  const today = startOfDay(new Date())
  const todayOffset = differenceInDays(today, start)

  // Group by track
  const tracks = Object.entries(TRACK_TYPES)
    .map(([key, info]) => ({
      key,
      ...info,
      projects: projects.filter(p => p.track_type === key),
    }))
    .filter(t => t.projects.length > 0)

  if (tracks.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Track Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tracks.map(track => (
            <div key={track.key}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{track.icon}</span>
                <span className="text-xs font-medium">{track.label}</span>
                <span className="text-[10px] text-muted-foreground">({track.projects.length})</span>
              </div>
              <div className="relative h-6 bg-[#F1F1F1] rounded overflow-hidden">
                {/* Today marker */}
                {todayOffset >= 0 && todayOffset <= totalDays && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                    style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                  />
                )}
                {/* Project bars */}
                {track.projects.map(p => {
                  const pStart = Math.max(0, differenceInDays(
                    startOfDay(new Date(p.created_at || conferenceStart)), start
                  ))
                  const pEnd = Math.min(totalDays, differenceInDays(
                    startOfDay(new Date(p.deadline || conferenceEnd)), start
                  ) + 1)
                  const left = (pStart / totalDays) * 100
                  const width = Math.max(((pEnd - pStart) / totalDays) * 100, 2)

                  return (
                    <div
                      key={p.id}
                      className="absolute top-0.5 bottom-0.5 rounded-sm opacity-80 hover:opacity-100"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: TRACK_COLORS[track.key],
                      }}
                      title={`${p.title} (${PROJECT_STATUS[p.status]?.label})`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Date labels */}
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>{format(start, 'MM.dd', { locale: ko })}</span>
          <span>{format(end, 'MM.dd', { locale: ko })}</span>
        </div>
      </CardContent>
    </Card>
  )
}

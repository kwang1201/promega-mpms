import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { differenceInDays, format, isWithinInterval, startOfDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { PROJECT_STATUS, TRACK_TYPES } from '@/lib/constants'

const STATUS_COLORS = {
  draft: '#EBE7E3',
  quotation: '#199AC2',
  in_production: '#FDB813',
  in_review: '#713A61',
  approved: '#199AC2',
  final_prep: '#455DA0',
  completed: '#13294B',
}

export default function GanttChart({ projects = [], startDate, endDate }) {
  const today = startOfDay(new Date())
  const start = startOfDay(new Date(startDate))
  const end = startOfDay(new Date(endDate))
  const totalDays = differenceInDays(end, start) + 1

  // Generate week markers
  const weeks = useMemo(() => {
    const result = []
    const current = new Date(start)
    while (current <= end) {
      const dayOffset = differenceInDays(current, start)
      result.push({ date: new Date(current), offset: dayOffset })
      current.setDate(current.getDate() + 7)
    }
    return result
  }, [start, end])

  const todayOffset = differenceInDays(today, start)
  const showToday = todayOffset >= 0 && todayOffset <= totalDays

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No projects with deadlines</p>
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header: week markers */}
        <div className="flex border-b pb-1 mb-2 ml-[200px] relative" style={{ width: `${totalDays * 4}px` }}>
          {weeks.map((w, i) => (
            <div
              key={i}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: `${w.offset * 4}px` }}
            >
              {format(w.date, 'MM.dd', { locale: ko })}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {projects.map(project => {
            const track = TRACK_TYPES[project.track_type]
            const status = PROJECT_STATUS[project.status]
            const projStart = project.created_at ? startOfDay(new Date(project.created_at)) : start
            const projEnd = project.deadline ? startOfDay(new Date(project.deadline)) : end

            const barStart = Math.max(0, differenceInDays(projStart, start))
            const barEnd = Math.min(totalDays, differenceInDays(projEnd, start) + 1)
            const barWidth = Math.max(barEnd - barStart, 1)

            return (
              <div key={project.id} className="flex items-center group">
                {/* Label */}
                <Link
                  to={`/projects/${project.id}`}
                  className="w-[200px] shrink-0 pr-3 truncate text-xs hover:text-[#199AC2]"
                  title={project.title}
                >
                  <span className="mr-1">{track?.icon}</span>
                  {project.title}
                </Link>
                {/* Bar area */}
                <div className="relative h-7" style={{ width: `${totalDays * 4}px` }}>
                  {/* Background grid */}
                  <div className="absolute inset-0 bg-[#F1F1F1] rounded" />
                  {/* Today marker */}
                  {showToday && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                      style={{ left: `${todayOffset * 4}px` }}
                    />
                  )}
                  {/* Project bar */}
                  <div
                    className="absolute top-1 bottom-1 rounded-sm transition-all group-hover:brightness-110"
                    style={{
                      left: `${barStart * 4}px`,
                      width: `${barWidth * 4}px`,
                      backgroundColor: STATUS_COLORS[project.status] || '#EBE7E3',
                      minWidth: '8px',
                    }}
                  >
                    <span className="text-[9px] text-white px-1 truncate block leading-5 font-medium">
                      {status?.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-4 ml-[200px] flex-wrap">
          {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS[key] }} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-3 h-px bg-red-400" />
            <span className="text-[10px] text-muted-foreground">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

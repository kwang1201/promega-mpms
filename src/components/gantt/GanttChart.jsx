import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Gantt from 'frappe-gantt'
import './frappe-gantt.css'
import { format } from 'date-fns'
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

export default function GanttChart({ projects = [] }) {
  const containerRef = useRef(null)
  const ganttRef = useRef(null)
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('Week')

  useEffect(() => {
    if (!containerRef.current || projects.length === 0) return

    // Clear previous
    containerRef.current.innerHTML = ''
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    containerRef.current.appendChild(svgEl)

    const tasks = projects.map(p => {
      const track = TRACK_TYPES[p.track_type]
      const startDate = p.created_at ? new Date(p.created_at) : new Date()
      const endDate = p.deadline ? new Date(p.deadline) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)

      return {
        id: p.id,
        name: `${track?.icon || ''} ${p.title}`,
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
        progress: p.status === 'completed' ? 100
          : p.status === 'approved' ? 80
          : p.status === 'in_review' ? 60
          : p.status === 'in_production' ? 40
          : p.status === 'quotation' ? 20
          : 5,
        custom_class: `gantt-bar-${p.status}`,
      }
    })

    try {
      ganttRef.current = new Gantt(svgEl, tasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        bar_height: 28,
        bar_corner_radius: 4,
        padding: 14,
        language: 'en',
        on_click: (task) => {
          navigate(`/projects/${task.id}`)
        },
      })
    } catch (e) {
      console.error('Gantt init error:', e)
    }
  }, [projects, viewMode, navigate])

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No projects with deadlines</p>
  }

  return (
    <div className="space-y-3">
      {/* View mode toggle */}
      <div className="flex gap-1">
        {['Day', 'Week', 'Month'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === mode
                ? 'bg-[#13294B] text-white'
                : 'bg-[#F1F1F1] text-[#515151] hover:bg-[#EBE7E3]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Gantt container */}
      <div
        ref={containerRef}
        className="overflow-x-auto gantt-container"
      />

      {/* Custom styles for frappe-gantt */}
      <style>{`
        .gantt-container .gantt .bar-wrapper .bar {
          fill: #455DA0;
        }
        .gantt-container .gantt .bar-wrapper .bar-progress {
          fill: #199AC2;
        }
        .gantt-container .gantt .bar-wrapper:hover .bar {
          fill: #13294B;
        }
        .gantt-container .gantt .bar-label {
          fill: #fff;
          font-size: 11px;
          font-family: 'Roboto Flex Variable', sans-serif;
        }
        .gantt-container .gantt .grid-header {
          fill: #F1F1F1;
        }
        .gantt-container .gantt .grid-row {
          fill: #fff;
        }
        .gantt-container .gantt .grid-row:nth-child(even) {
          fill: #fafafa;
        }
        .gantt-container .gantt .today-highlight {
          fill: rgba(253, 184, 19, 0.1);
        }
        .gantt-container .gantt .lower-text, .gantt-container .gantt .upper-text {
          font-family: 'Roboto Flex Variable', sans-serif;
          font-size: 11px;
          fill: #515151;
        }
        .gantt-bar-draft .bar { fill: #EBE7E3 !important; }
        .gantt-bar-draft .bar-progress { fill: #bbb !important; }
        .gantt-bar-quotation .bar { fill: #199AC2 !important; }
        .gantt-bar-quotation .bar-progress { fill: #13294B !important; }
        .gantt-bar-in_production .bar { fill: #FDB813 !important; }
        .gantt-bar-in_production .bar-progress { fill: #946d00 !important; }
        .gantt-bar-in_review .bar { fill: #713A61 !important; }
        .gantt-bar-in_review .bar-progress { fill: #5a2d4d !important; }
        .gantt-bar-approved .bar { fill: #199AC2 !important; }
        .gantt-bar-approved .bar-progress { fill: #13294B !important; }
        .gantt-bar-final_prep .bar { fill: #455DA0 !important; }
        .gantt-bar-final_prep .bar-progress { fill: #13294B !important; }
        .gantt-bar-completed .bar { fill: #13294B !important; }
        .gantt-bar-completed .bar-progress { fill: #13294B !important; }
      `}</style>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS[key] }} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

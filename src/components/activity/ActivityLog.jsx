import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useActivityLog } from '@/hooks/useActivityLog'
import { PROJECT_STATUS, ROLES } from '@/lib/constants'
import { Activity, ArrowRight, FileUp, MessageSquare, CheckCircle } from 'lucide-react'

const ACTION_CONFIG = {
  submit_to_ms: { icon: ArrowRight, text: 'MS팀에 제출' },
  send_to_owner: { icon: ArrowRight, text: 'Owner 검토 요청' },
  skip_to_quotation: { icon: ArrowRight, text: 'Owner 검토 생략, 견적 요청' },
  return_to_draft: { icon: ArrowRight, text: '초안으로 반려' },
  approve_to_quotation: { icon: CheckCircle, text: '승인, 견적 요청 진행' },
  request_changes: { icon: ArrowRight, text: '수정 요청' },
  submit_quotation: { icon: FileUp, text: '견적서 제출' },
  send_for_approval: { icon: ArrowRight, text: 'Owner 승인 요청' },
  approve_quotation: { icon: CheckCircle, text: '견적 승인' },
  reject_quotation: { icon: ArrowRight, text: '견적 반려' },
  start_production: { icon: ArrowRight, text: '제작 시작' },
  submit_invoice: { icon: FileUp, text: '세금계산서 제출' },
  complete_project: { icon: CheckCircle, text: '프로젝트 완료' },
  file_upload: { icon: FileUp, text: '파일 업로드' },
  comment_added: { icon: MessageSquare, text: '코멘트 추가' },
  status_change: { icon: ArrowRight, text: '상태 변경' },
}

function getActionText(action, details) {
  const config = ACTION_CONFIG[action]
  if (config) {
    if (details?.fromStatus && details?.toStatus) {
      const from = PROJECT_STATUS[details.fromStatus]?.label || details.fromStatus
      const to = PROJECT_STATUS[details.toStatus]?.label || details.toStatus
      return `${config.text} (${from} → ${to})`
    }
    if (details?.filename) {
      return `${config.text}: ${details.filename}`
    }
    return config.text
  }
  return action
}

function getActionIcon(action) {
  const config = ACTION_CONFIG[action]
  return config?.icon || Activity
}

export default function ActivityLog({ projectId }) {
  const { data: logs = [], isLoading } = useActivityLog(projectId)

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Loading activity...</div>

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4" />
        Activity Log
      </h3>
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-3">
            {logs.map((log) => {
              const Icon = getActionIcon(log.action)
              return (
                <div key={log.id} className="flex items-start gap-3 relative pl-1">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0 z-10">
                    <Icon className="h-3 w-3 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{log.user?.name || 'System'}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({ROLES[log.user?.role] || log.user?.role})
                      </span>
                      <span className="text-muted-foreground"> — </span>
                      <span>{getActionText(log.action, log.details)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ko })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

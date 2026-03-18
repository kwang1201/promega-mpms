import { useNavigate } from 'react-router-dom'
import { Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const EVENT_ICONS = {
  file_upload: '📁',
  review_status: '📋',
  comment: '💬',
  deadline: '⏰',
  status_change: '🔄',
}

export default function NotificationPanel({ onClose }) {
  const { data: notifications = [], isLoading } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const navigate = useNavigate()

  function handleClick(notification) {
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
      onClose()
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border rounded-lg shadow-lg z-50 max-h-[480px] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => markAllAsRead.mutate()}
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1" />
          Mark all read
        </Button>
      </div>
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <p className="text-sm text-muted-foreground p-4 text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">No notifications</p>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-[#F1F1F1] transition-colors flex gap-3 ${
                !n.read ? 'bg-[#FDB813]/5' : ''
              }`}
            >
              <span className="text-base shrink-0 mt-0.5">
                {EVENT_ICONS[n.event_type] || '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${!n.read ? 'font-medium' : ''}`}>
                  {n.title}
                </p>
                {n.message && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{n.message}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ko })}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-[#199AC2] shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

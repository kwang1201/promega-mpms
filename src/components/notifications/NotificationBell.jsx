import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUnreadCount } from '@/hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="sm" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#FDB813] text-[#13294B] text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </div>
  )
}

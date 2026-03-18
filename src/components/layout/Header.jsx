import NotificationBell from '@/components/notifications/NotificationBell'

export default function Header({ title, children }) {
  return (
    <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex items-center gap-3">
        {children}
        <NotificationBell />
      </div>
    </header>
  )
}

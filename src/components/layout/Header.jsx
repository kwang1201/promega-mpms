import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Header({ title, breadcrumbs, children }) {
  return (
    <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {children}
        <NotificationBell />
      </div>
    </header>
  )
}

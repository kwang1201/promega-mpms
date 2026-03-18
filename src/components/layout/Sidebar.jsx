import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Columns3, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/conferences', icon: Building2, label: '학회 관리' },
  { to: '/kanban', icon: Columns3, label: '칸반 보드' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()

  return (
    <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="p-4">
        <h1 className="text-lg font-bold">MKT Process</h1>
        <p className="text-xs text-muted-foreground">마케팅 프로세스 관리</p>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'hover:bg-sidebar-accent/50'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {profile?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.role === 'owner' && '학회 오너'}
              {profile?.role === 'ms_staff' && 'MS 담당자'}
              {profile?.role === 'ms_manager' && 'MS 관리자'}
              {profile?.role === 'agency' && '외주업체'}
              {profile?.role === 'scm' && 'SCM'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  )
}

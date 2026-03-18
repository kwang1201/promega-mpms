import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Columns3, CircleDollarSign, FileText, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ROLES } from '@/lib/constants'

const INTERNAL_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/conferences', icon: Building2, label: 'Conferences' },
  { to: '/requests', icon: FileText, label: 'Requests' },
  { to: '/kanban', icon: Columns3, label: 'KANBAN Board' },
  { to: '/costs', icon: CircleDollarSign, label: 'Cost Management' },
]

const AGENCY_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Columns3, label: 'KANBAN Board' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const isAgency = profile?.role === 'agency'
  const navItems = isAgency ? AGENCY_NAV : INTERNAL_NAV

  return (
    <aside className="w-64 bg-[#13294B] text-white flex flex-col h-screen sticky top-0">
      <div className="p-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-[#FDB813] rounded-sm" />
          <div>
            <h1 className="text-base font-bold tracking-tight">MKT Process</h1>
            <p className="text-[11px] text-white/50">
              {isAgency ? 'Agency Portal' : 'Marketing Process Management'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10 mx-4" />

      <nav className="flex-1 p-3 space-y-1 mt-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-[#FDB813] text-[#13294B] font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="h-px bg-white/10 mx-4" />

      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-[#FDB813] text-[#13294B] flex items-center justify-center text-sm font-bold">
            {profile?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name}</p>
            <p className="text-[11px] text-white/50 truncate">
              {ROLES[profile?.role] || profile?.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-white/60 hover:text-white hover:bg-white/10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}

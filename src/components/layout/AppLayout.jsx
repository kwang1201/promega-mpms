import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-8 w-8 border-3 border-[#EBE7E3] border-t-[#13294B] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b">
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-5 bg-[#FDB813] rounded-sm" />
            <span className="text-sm font-bold text-[#13294B]">MKT Process</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

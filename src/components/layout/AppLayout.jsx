import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu, Clock, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-8 w-8 border-3 border-[#EBE7E3] border-t-[#13294B] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Show pending approval screen
  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F1F1] p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[#FDB813]/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-[#FDB813]" />
              </div>
            </div>
            <CardTitle className="text-xl text-[#13294B]">승인 대기 중</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              계정이 아직 승인되지 않았습니다.<br />
              MS Manager의 승인 후 시스템을 사용할 수 있습니다.
            </p>
            <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
              <p><strong>이름:</strong> {profile?.name}</p>
              <p><strong>이메일:</strong> {profile?.email}</p>
              <p><strong>역할:</strong> {profile?.role}</p>
              {profile?.company && <p><strong>회사:</strong> {profile?.company}</p>}
            </div>
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/ui/EmptyState'
import { useUsers, useUpdateUser, useAgencies } from '@/hooks/useUsers'
import { ROLES } from '@/lib/constants'

const ROLE_COLORS = {
  owner: 'bg-[#199AC2]/10 text-[#199AC2]',
  ms_staff: 'bg-[#455DA0]/10 text-[#455DA0]',
  ms_manager: 'bg-[#13294B]/10 text-[#13294B]',
  agency: 'bg-[#FDB813]/15 text-[#946d00]',
  scm: 'bg-[#713A61]/10 text-[#713A61]',
}

export default function UserManagementPage() {
  const { data: users = [], isLoading } = useUsers()
  const { data: agencies = [] } = useAgencies()
  const updateUser = useUpdateUser()

  async function handleRoleChange(userId, newRole) {
    await updateUser.mutateAsync({ id: userId, role: newRole })
    toast.success('User role updated')
  }

  async function handleAgencyChange(userId, agencyId) {
    await updateUser.mutateAsync({ id: userId, agency_id: agencyId || null })
    toast.success('User agency updated')
  }

  return (
    <>
      <Header title="User Management" breadcrumbs={[{ label: 'User Management' }]} />
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No users"
            description="Users will appear here after they sign up"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#13294B] text-white flex items-center justify-center text-xs font-bold">
                            {user.name?.[0] || '?'}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.agency_id || 'none'}
                          onValueChange={(v) => handleAgencyChange(user.id, v === 'none' ? null : v)}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {agencies.map(a => (
                              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(user.created_at), 'yyyy.MM.dd', { locale: ko })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

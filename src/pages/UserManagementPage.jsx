import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/ui/EmptyState'
import { useUsers, useUpdateUser } from '@/hooks/useUsers'
import { ROLES } from '@/lib/constants'

const STATUS_BADGE = {
  pending: { label: 'Pending', color: 'bg-[#FDB813]/15 text-[#946d00]' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

export default function UserManagementPage() {
  const { data: users = [], isLoading } = useUsers()
  const updateUser = useUpdateUser()

  const pendingUsers = users.filter(u => u.status === 'pending')
  const approvedUsers = users.filter(u => u.status !== 'pending')

  async function handleRoleChange(userId, newRole) {
    await updateUser.mutateAsync({ id: userId, role: newRole })
    toast.success('User role updated')
  }

  async function handleApprove(userId) {
    await updateUser.mutateAsync({ id: userId, status: 'approved' })
    toast.success('User approved')
  }

  async function handleReject(userId) {
    await updateUser.mutateAsync({ id: userId, status: 'rejected' })
    toast.success('User rejected')
  }

  return (
    <>
      <Header title="User Management" breadcrumbs={[{ label: 'User Management' }]} />
      <div className="p-6 space-y-6">
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
          <>
            {/* Pending Approval Section */}
            {pendingUsers.length > 0 && (
              <Card className="border-[#FDB813]/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className="bg-[#FDB813]/15 text-[#946d00]">{pendingUsers.length}</Badge>
                    승인 대기 중
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-[#FDB813] text-[#13294B] flex items-center justify-center text-xs font-bold">
                                {user.name?.[0] || '?'}
                              </div>
                              {user.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ROLES[user.role] || user.role}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.company || '-'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(user.created_at), 'yyyy.MM.dd', { locale: ko })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7" onClick={() => handleApprove(user.id)}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                승인
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7" onClick={() => handleReject(user.id)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                거절
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* All Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  All Users ({approvedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map(user => {
                      const statusInfo = STATUS_BADGE[user.status] || STATUS_BADGE.approved
                      return (
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
                          <TableCell className="text-muted-foreground">{user.company || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(user.created_at), 'yyyy.MM.dd', { locale: ko })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}

import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CheckCircle2, XCircle, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'

const COST_STATUS = {
  pending: { label: 'Pending', color: 'bg-[#EBE7E3] text-[#515151]' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  paid: { label: 'Paid', color: 'bg-[#13294B]/10 text-[#13294B]' },
}

const COST_TYPE_LABEL = {
  quotation: 'Quotation',
  invoice: 'Invoice',
  other: 'Other',
}

export default function CostItemList({ costs = [], onApprove, onReject, onMarkPaid, loading }) {
  const { profile } = useAuth()
  const canApprove = ['ms_staff', 'ms_manager'].includes(profile?.role)

  if (costs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No cost items yet</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Project</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          {canApprove && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {costs.map(cost => {
          const status = COST_STATUS[cost.status]
          return (
            <TableRow key={cost.id}>
              <TableCell>
                <Badge variant="outline">{COST_TYPE_LABEL[cost.type]}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{cost.description}</TableCell>
              <TableCell className="text-muted-foreground">{cost.vendor || '-'}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{cost.project?.title || '-'}</TableCell>
              <TableCell className="text-right font-medium">₩{Number(cost.amount).toLocaleString()}</TableCell>
              <TableCell>
                <Badge className={status?.color}>{status?.label}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(cost.created_at), 'MM.dd', { locale: ko })}
              </TableCell>
              {canApprove && (
                <TableCell>
                  <div className="flex gap-1">
                    {cost.status === 'pending' && (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 text-green-600" onClick={() => onApprove(cost.id)} disabled={loading}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-red-600" onClick={() => onReject(cost.id)} disabled={loading}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {cost.status === 'approved' && (
                      <Button size="sm" variant="ghost" className="h-7 text-[#13294B]" onClick={() => onMarkPaid(cost.id)} disabled={loading}>
                        <Wallet className="h-3.5 w-3.5 mr-1" />
                        Paid
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

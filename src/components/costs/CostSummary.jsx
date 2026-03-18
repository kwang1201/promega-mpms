import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp, Receipt, CircleDollarSign } from 'lucide-react'

export default function CostSummary({ budget = 0, costs = [] }) {
  const totalQuoted = costs
    .filter(c => c.type === 'quotation' && c.status !== 'rejected')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const totalApproved = costs
    .filter(c => c.status === 'approved' || c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const totalPaid = costs
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  const remaining = budget - totalApproved

  const items = [
    { label: 'Budget', value: budget, icon: Wallet, color: 'bg-[#199AC2]/10', iconColor: 'text-[#199AC2]' },
    { label: 'Quoted', value: totalQuoted, icon: Receipt, color: 'bg-[#FDB813]/15', iconColor: 'text-[#946d00]' },
    { label: 'Approved', value: totalApproved, icon: TrendingUp, color: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Remaining', value: remaining, icon: CircleDollarSign, color: remaining >= 0 ? 'bg-[#13294B]/10' : 'bg-red-50', iconColor: remaining >= 0 ? 'text-[#13294B]' : 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(item => (
        <Card key={item.label}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-lg font-bold">₩{item.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

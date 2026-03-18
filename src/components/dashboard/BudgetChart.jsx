import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BudgetChart({ conferences = [], costs = [] }) {
  // Group costs by conference
  const data = conferences.map(conf => {
    const confCosts = costs.filter(c => c.conference_id === conf.id)
    const spent = confCosts
      .filter(c => c.status === 'approved' || c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.amount), 0)
    const budget = Number(conf.budget || 0)
    return { name: conf.name, budget, spent, percent: budget > 0 ? Math.round((spent / budget) * 100) : 0 }
  }).filter(d => d.budget > 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Budget Overview</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No budget data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Budget Overview</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {data.map(d => (
          <div key={d.name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium truncate">{d.name}</span>
              <span className="text-muted-foreground">
                ₩{d.spent.toLocaleString()} / ₩{d.budget.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-[#EBE7E3] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  d.percent > 90 ? 'bg-red-500' : d.percent > 70 ? 'bg-[#FDB813]' : 'bg-[#199AC2]'
                }`}
                style={{ width: `${Math.min(d.percent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{d.percent}% used</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

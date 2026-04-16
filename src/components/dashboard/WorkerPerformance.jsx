import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'
import { useWorkerStats } from '@/hooks/useWorkerStats'
import { ROLES } from '@/lib/constants'

export default function WorkerPerformance() {
  const { data: stats = [], isLoading } = useWorkerStats()

  if (isLoading) return null
  if (stats.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Worker Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Completed</TableHead>
              <TableHead className="text-center">In Progress</TableHead>
              <TableHead className="text-center">Completion %</TableHead>
              <TableHead className="text-center">Avg Reviews</TableHead>
              <TableHead className="text-center">Avg Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(worker => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">
                  {worker.name}
                  {worker.company && (
                    <span className="text-xs text-muted-foreground ml-1">({worker.company})</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {ROLES[worker.role] || worker.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{worker.totalProjects}</TableCell>
                <TableCell className="text-center">{worker.completed}</TableCell>
                <TableCell className="text-center">{worker.inProgress}</TableCell>
                <TableCell className="text-center">
                  <span className={worker.completionRate >= 80 ? 'text-green-600 font-medium' : worker.completionRate >= 50 ? 'text-[#946d00] font-medium' : ''}>
                    {worker.completionRate}%
                  </span>
                </TableCell>
                <TableCell className="text-center">{worker.avgReviewRounds}</TableCell>
                <TableCell className="text-center">
                  {worker.avgDays !== '-' ? `${worker.avgDays}d` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/layout/Header'
import CostItemForm from '@/components/costs/CostItemForm'
import CostItemList from '@/components/costs/CostItemList'
import CostSummary from '@/components/costs/CostSummary'
import { useAllCosts, useCreateCost, useUpdateCost } from '@/hooks/useCosts'
import { useConferences } from '@/hooks/useConferences'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'

export default function CostManagementPage() {
  const { user } = useAuth()
  const { data: allCosts = [], isLoading } = useAllCosts()
  const { data: conferences = [] } = useConferences()
  const [filterConference, setFilterConference] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const createCost = useCreateCost()
  const updateCost = useUpdateCost()

  const filteredCosts = filterConference === 'all'
    ? allCosts
    : allCosts.filter(c => c.conference_id === filterConference)

  const selectedConference = conferences.find(c => c.id === filterConference)

  // Get projects for the selected conference (for the form)
  const { data: projects = [] } = useProjects(filterConference !== 'all' ? filterConference : undefined)

  // Calculate totals across all or filtered costs
  const totalBudget = filterConference === 'all'
    ? conferences.reduce((sum, c) => sum + Number(c.budget || 0), 0)
    : Number(selectedConference?.budget || 0)

  async function handleApprove(id) {
    await updateCost.mutateAsync({ id, status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
  }
  async function handleReject(id) {
    await updateCost.mutateAsync({ id, status: 'rejected' })
  }
  async function handleMarkPaid(id) {
    await updateCost.mutateAsync({ id, status: 'paid' })
  }

  return (
    <>
      <Header title="Cost Management">
        <Select value={filterConference} onValueChange={setFilterConference}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by conference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conferences</SelectItem>
            {conferences.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filterConference !== 'all' && (
          <Button size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Cost
          </Button>
        )}
      </Header>
      <div className="p-6 space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            <CostSummary budget={totalBudget} costs={filteredCosts} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Cost Items ({filteredCosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostItemList
                  costs={filteredCosts}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onMarkPaid={handleMarkPaid}
                  loading={updateCost.isPending}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {filterConference !== 'all' && (
        <CostItemForm
          open={showForm}
          onOpenChange={setShowForm}
          conferenceId={filterConference}
          projects={projects}
          onSubmit={(data) => createCost.mutateAsync(data)}
        />
      )}
    </>
  )
}

import { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/ui/EmptyState'
import ConferenceCard from '@/components/conferences/ConferenceCard'
import ConferenceForm from '@/components/conferences/ConferenceForm'
import { useConferences, useCreateConference } from '@/hooks/useConferences'

export default function ConferencesPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: conferences, isLoading } = useConferences()
  const createConference = useCreateConference()

  async function handleCreate(data) {
    await createConference.mutateAsync(data)
    toast.success('Conference created successfully')
  }

  return (
    <>
      <Header title="Conferences">
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#13294B] hover:bg-[#13294B]/90">
          <Plus className="h-4 w-4 mr-1" />
          New Conference
        </Button>
      </Header>
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : conferences?.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No conferences registered"
            description="Create a new conference to start managing your exhibition projects"
            action={() => setShowForm(true)}
            actionLabel="New Conference"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {conferences?.map(conf => (
              <ConferenceCard key={conf.id} conference={conf} />
            ))}
          </div>
        )}
      </div>
      <ConferenceForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleCreate}
      />
    </>
  )
}

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import ConferenceCard from '@/components/conferences/ConferenceCard'
import ConferenceForm from '@/components/conferences/ConferenceForm'
import { useConferences, useCreateConference } from '@/hooks/useConferences'

export default function ConferencesPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: conferences, isLoading } = useConferences()
  const createConference = useCreateConference()

  return (
    <>
      <Header title="학회 관리">
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          새 학회
        </Button>
      </Header>
      <div className="p-6">
        {isLoading ? (
          <p className="text-muted-foreground">로딩 중...</p>
        ) : conferences?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">등록된 학회가 없습니다</p>
            <p className="text-sm">새 학회를 등록하여 시작하세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conferences?.map(conf => (
              <ConferenceCard key={conf.id} conference={conf} />
            ))}
          </div>
        )}
      </div>
      <ConferenceForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(data) => createConference.mutateAsync(data)}
      />
    </>
  )
}

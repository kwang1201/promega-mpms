import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ReviewActions from './ReviewActions'
import CommentList from '@/components/comments/CommentList'
import { useReviews, useCreateReview, useUpdateReview } from '@/hooks/useReviews'
import { useAuth } from '@/contexts/AuthContext'
import { notifyProjectMembers } from '@/lib/notify'

const REVIEW_STATUS = {
  pending: { label: 'Pending', color: 'bg-[#EBE7E3] text-[#515151]' },
  in_review: { label: 'In Review', color: 'bg-[#713A61]/10 text-[#713A61]' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  conditional: { label: 'Conditional', color: 'bg-[#FDB813]/15 text-[#946d00]' },
}

export default function ReviewPanel({ projectId, reviewPhase = 'ms_review' }) {
  const { user, profile } = useAuth()
  const { data: reviews = [], isLoading } = useReviews(projectId, reviewPhase)
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()

  const canReview = reviewPhase === 'design_review'
    ? ['user', 'ms_staff', 'ms_manager'].includes(profile?.role)
    : ['user', 'ms_staff', 'ms_manager'].includes(profile?.role)

  const phaseLabel = reviewPhase === 'design_review' ? 'Design Review' : 'Review'

  async function handleCreateReview() {
    await createReview.mutateAsync({
      project_id: projectId,
      reviewer_id: user.id,
      status: 'in_review',
      review_phase: reviewPhase,
    })
    notifyProjectMembers({
      projectId,
      excludeUserId: user.id,
      eventType: 'review_status',
      title: 'New Review Round Started',
      message: `${profile?.name} started a new review round`,
      link: `/projects/${projectId}`,
    })
  }

  async function handleAction(reviewId, status) {
    await updateReview.mutateAsync({ id: reviewId, status })
    const statusLabel = REVIEW_STATUS[status]?.label
    notifyProjectMembers({
      projectId,
      excludeUserId: user.id,
      eventType: 'review_status',
      title: `Review ${statusLabel}`,
      message: `${profile?.name} marked review as ${statusLabel}`,
      link: `/projects/${projectId}`,
    })
  }

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{phaseLabel} Rounds ({reviews.length})</span>
        {canReview && (
          <Button size="sm" variant="outline" onClick={handleCreateReview} disabled={createReview.isPending}>
            <Plus className="h-4 w-4 mr-1" />
            New Round
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No review rounds yet</p>
      ) : (
        reviews.map(review => {
          const status = REVIEW_STATUS[review.status]
          return (
            <Card key={review.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Round {review.round}</span>
                    <Badge className={status?.color}>{status?.label}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                  </span>
                </div>

                {review.reviewer && (
                  <p className="text-xs text-muted-foreground">
                    Reviewer: {review.reviewer.name}
                  </p>
                )}
                {review.file && (
                  <p className="text-xs text-muted-foreground">
                    File: {review.file.original_name} (v{review.file.version})
                  </p>
                )}
                {review.comment && (
                  <p className="text-sm text-foreground bg-[#F1F1F1] p-3 rounded">{review.comment}</p>
                )}

                {canReview && ['pending', 'in_review'].includes(review.status) && (
                  <ReviewActions
                    onAction={(status) => handleAction(review.id, status)}
                    loading={updateReview.isPending}
                  />
                )}

                {/* Comments for this review round */}
                <div className="border-t pt-3 mt-3">
                  <CommentList projectId={projectId} reviewId={review.id} />
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

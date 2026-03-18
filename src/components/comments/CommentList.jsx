import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageSquare, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CommentForm from './CommentForm'
import { useComments, useCreateComment } from '@/hooks/useComments'
import { useAuth } from '@/contexts/AuthContext'
import { notifyProjectMembers } from '@/lib/notify'
import { ROLES } from '@/lib/constants'

export default function CommentList({ projectId, fileId, reviewId }) {
  const { user } = useAuth()
  const { data: allComments = [], isLoading } = useComments(projectId)
  const createComment = useCreateComment()
  const [replyTo, setReplyTo] = useState(null)

  // Filter by file/review if provided
  const comments = allComments.filter(c => {
    if (fileId && c.file_id !== fileId) return false
    if (reviewId && c.review_id !== reviewId) return false
    if (!fileId && !reviewId && (c.file_id || c.review_id)) return false
    return true
  })

  // Build thread structure
  const topLevel = comments.filter(c => !c.parent_id)
  const replies = comments.filter(c => c.parent_id)
  const repliesByParent = {}
  replies.forEach(r => {
    if (!repliesByParent[r.parent_id]) repliesByParent[r.parent_id] = []
    repliesByParent[r.parent_id].push(r)
  })

  async function handleSubmit(content, parentId = null) {
    await createComment.mutateAsync({
      project_id: projectId,
      file_id: fileId || null,
      review_id: reviewId || null,
      author_id: user.id,
      content,
      parent_id: parentId,
    })
    setReplyTo(null)
    notifyProjectMembers({
      projectId,
      excludeUserId: user.id,
      eventType: 'comment',
      title: 'New Comment',
      message: content.slice(0, 100),
      link: `/projects/${projectId}`,
    })
  }

  function CommentItem({ comment, depth = 0 }) {
    const childReplies = repliesByParent[comment.id] || []
    return (
      <div className={depth > 0 ? 'ml-6 border-l-2 border-[#EBE7E3] pl-4' : ''}>
        <div className="py-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-[#13294B] text-white flex items-center justify-center text-[10px] font-bold">
              {comment.author?.name?.[0] || '?'}
            </div>
            <span className="text-sm font-medium">{comment.author?.name}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {ROLES[comment.author?.role] || comment.author?.role}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {format(new Date(comment.created_at), 'MM.dd HH:mm', { locale: ko })}
            </span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
          {depth === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground mt-1 h-6 px-2"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {replyTo === comment.id && (
            <div className="mt-2">
              <CommentForm
                onSubmit={(content) => handleSubmit(content, comment.id)}
                placeholder="Write a reply..."
                loading={createComment.isPending}
              />
            </div>
          )}
        </div>
        {childReplies.map(reply => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Comments ({comments.length})</span>
      </div>

      <CommentForm
        onSubmit={(content) => handleSubmit(content)}
        loading={createComment.isPending}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">Loading...</p>
      ) : topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No comments yet</p>
      ) : (
        <div className="divide-y">
          {topLevel.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

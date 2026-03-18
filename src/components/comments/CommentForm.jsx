import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

export default function CommentForm({ onSubmit, placeholder = 'Write a comment...', loading }) {
  const [content, setContent] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    await onSubmit(content.trim())
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="flex-1 resize-none"
      />
      <Button type="submit" size="sm" disabled={!content.trim() || loading} className="self-end bg-[#13294B] hover:bg-[#13294B]/90">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}

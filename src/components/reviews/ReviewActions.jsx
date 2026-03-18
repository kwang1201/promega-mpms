import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReviewActions({ onAction, loading }) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => onAction('approved')}
        disabled={loading}
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onAction('rejected')}
        disabled={loading}
      >
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Reject
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-[#FDB813] text-[#946d00] hover:bg-[#FDB813]/10"
        onClick={() => onAction('conditional')}
        disabled={loading}
      >
        <AlertCircle className="h-3.5 w-3.5 mr-1" />
        Conditional
      </Button>
    </div>
  )
}

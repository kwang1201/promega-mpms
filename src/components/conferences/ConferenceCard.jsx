import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, User, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CONFERENCE_STATUS } from '@/lib/constants'

export default function ConferenceCard({ conference }) {
  const status = CONFERENCE_STATUS[conference.status]

  return (
    <Link to={`/conferences/${conference.id}`}>
      <Card className="card-hover cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{conference.name}</CardTitle>
            <Badge variant="secondary" className={`shrink-0 ${status?.color}`}>
              {status?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              {format(new Date(conference.date_start), 'yyyy.MM.dd', { locale: ko })}
              {' - '}
              {format(new Date(conference.date_end), 'MM.dd', { locale: ko })}
            </span>
          </div>
          {conference.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{conference.location}</span>
            </div>
          )}
          {conference.owner && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span>{conference.owner.name}</span>
            </div>
          )}
          {conference.budget > 0 && (
            <div className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5" />
              <span>₩{Number(conference.budget).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

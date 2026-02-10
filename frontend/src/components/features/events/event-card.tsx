import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/types/api'
import { formatDate } from '@/lib/utils/format'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'

interface EventCardProps {
  event: Event
  oshiName?: string
}

export function EventCard({ event, oshiName }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            {oshiName && <CardDescription className="mt-1">{oshiName}</CardDescription>}
          </div>
          {event.isRegistered && (
            <Badge variant="secondary">カレンダー登録済み</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(event.startDate)}
              {event.endDate && event.endDate !== event.startDate && ` 〜 ${formatDate(event.endDate)}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}

          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              詳細を見る
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PriorityBadge } from '@/components/shared/priority-badge'
import type { CollectedInfo } from '@/types/api'
import { formatRelativeTime } from '@/lib/utils/format'
import { ExternalLink } from 'lucide-react'

interface TimelineItemProps {
  info: CollectedInfo
  oshiName?: string
}

export function TimelineItem({ info, oshiName }: TimelineItemProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{info.title}</CardTitle>
            <CardDescription className="mt-1">
              {oshiName && <span className="font-medium">{oshiName}</span>}
              {oshiName && ' • '}
              {formatRelativeTime(info.collectedAt)}
            </CardDescription>
          </div>
          <PriorityBadge priority={info.priority} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{info.content}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>情報源: {info.source}</span>
          {info.url && (
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
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

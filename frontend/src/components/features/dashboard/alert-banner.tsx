import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CollectedInfo, Oshi } from '@/types/api'
import { formatRelativeTime } from '@/lib/utils/format'
import { AlertTriangle, Bell, ExternalLink } from 'lucide-react'

interface AlertBannerProps {
  urgentInfos: CollectedInfo[]
  importantInfos: CollectedInfo[]
  oshis: Oshi[]
}

export function AlertBanner({ urgentInfos, importantInfos, oshis }: AlertBannerProps) {
  const oshiMap = new Map(oshis.map((o) => [o.id, o.name]))

  if (urgentInfos.length === 0 && importantInfos.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="py-4">
          <p className="text-sm text-green-800 dark:text-green-200 text-center">
            現在、緊急・注目の情報はありません。見逃しゼロの状態です。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {urgentInfos.length > 0 && (
        <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5" />
              緊急アラート
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100 ml-auto">
                {urgentInfos.length}件
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {urgentInfos.map((info) => (
              <AlertItem key={info.id} info={info} oshiName={oshiMap.get(info.oshiId)} variant="urgent" />
            ))}
          </CardContent>
        </Card>
      )}

      {importantInfos.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <Bell className="h-5 w-5" />
              注目情報
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 ml-auto">
                {importantInfos.length}件
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {importantInfos.map((info) => (
              <AlertItem key={info.id} info={info} oshiName={oshiMap.get(info.oshiId)} variant="important" />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AlertItem({
  info,
  oshiName,
  variant,
}: {
  info: CollectedInfo
  oshiName?: string
  variant: 'urgent' | 'important'
}) {
  const borderClass = variant === 'urgent'
    ? 'border-red-200 dark:border-red-800'
    : 'border-yellow-200 dark:border-yellow-800'
  const textClass = variant === 'urgent'
    ? 'text-red-900 dark:text-red-100'
    : 'text-yellow-900 dark:text-yellow-100'
  const subTextClass = variant === 'urgent'
    ? 'text-red-700 dark:text-red-300'
    : 'text-yellow-700 dark:text-yellow-300'

  return (
    <div className={`rounded-lg border p-3 ${borderClass} bg-white/50 dark:bg-black/20`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${textClass}`}>{info.title}</p>
          <p className={`text-xs mt-1 ${subTextClass}`}>
            {oshiName && <span className="font-medium">{oshiName}</span>}
            {oshiName && ' · '}
            {formatRelativeTime(info.collectedAt)}
          </p>
        </div>
        {info.url && (
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium ${subTextClass} hover:underline`}
          >
            詳細
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}

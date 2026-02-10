import { Suspense } from 'react'
import { getUserId } from '@/lib/auth/session'
import { getOshis } from '@/lib/firestore/oshis'
import { getInfos } from '@/lib/firestore/infos'
import { TimelineList } from '@/components/features/timeline/timeline-list'
import { TimelineFilter } from '@/components/features/timeline/timeline-filter'
import { TimelineEmpty } from '@/components/features/timeline/timeline-empty'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import type { Priority } from '@/types/api'

interface TimelinePageProps {
  searchParams: Promise<{
    oshiId?: string
    priority?: Priority
  }>
}

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const { oshiId, priority } = await searchParams
  const userId = await getUserId()
  const oshis = await getOshis(userId)

  const infos = await getInfos(userId, {
    oshiId,
    priority,
    limit: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">タイムライン</h1>
        <p className="text-muted-foreground">推しに関する最新情報</p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <TimelineFilter oshis={oshis} />
      </Suspense>

      {infos.length === 0 ? (
        <TimelineEmpty />
      ) : (
        <TimelineList infos={infos} oshis={oshis} />
      )}
    </div>
  )
}

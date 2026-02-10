import { getUserId } from '@/lib/auth/session'
import { getOshis } from '@/lib/firestore/oshis'
import { getEvents } from '@/lib/firestore/events'
import { EventCard } from '@/components/features/events/event-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EventsPage() {
  const userId = await getUserId()
  const oshis = await getOshis(userId)
  const events = await getEvents(userId, { limit: 100 })

  const oshiMap = new Map(oshis.map((oshi) => [oshi.id, oshi.name]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">イベント</h1>
        <p className="text-muted-foreground">収集されたイベント情報</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="イベントがまだありません"
          description="推しを登録すると、AIが自動でイベント情報を収集します。"
          action={
            <Button asChild>
              <Link href="/oshi/new">推しを登録する</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <EventCard event={event} oshiName={oshiMap.get(event.oshiId)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

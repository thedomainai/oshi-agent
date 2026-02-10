import { getUserId } from '@/lib/auth/session'
import { getEvent } from '@/lib/firestore/events'
import { getOshi } from '@/lib/firestore/oshis'
import { EventCard } from '@/components/features/events/event-card'
import { CalendarRegisterButton } from '@/components/features/events/calendar-register-button'
import { TripPlanGenerateButton } from '@/components/features/trip-plans/trip-plan-generate-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const userId = await getUserId()
  const event = await getEvent(id, userId)
  const oshi = await getOshi(event.oshiId, userId)

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          イベント一覧に戻る
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">イベント詳細</h1>
      </div>

      <EventCard event={event} oshiName={oshi.name} />

      <div className="flex gap-4">
        <CalendarRegisterButton eventId={event.id} isRegistered={event.isRegistered} />
        <TripPlanGenerateButton eventId={event.id} />
      </div>
    </div>
  )
}

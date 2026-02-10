import { getUserId } from '@/lib/auth/session'
import { getTripPlan } from '@/lib/firestore/trip-plans'
import { getEvent } from '@/lib/firestore/events'
import { TripPlanCard } from '@/components/features/trip-plans/trip-plan-card'
import { TripPlanGenerateButton } from '@/components/features/trip-plans/trip-plan-generate-button'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Map } from 'lucide-react'

interface TripPlanPageProps {
  params: Promise<{ eventId: string }>
}

export default async function TripPlanPage({ params }: TripPlanPageProps) {
  const { eventId } = await params
  const userId = await getUserId()
  const event = await getEvent(eventId, userId)
  const tripPlan = await getTripPlan(eventId, userId)

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          イベント一覧に戻る
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">遠征プラン</h1>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      {tripPlan ? (
        <TripPlanCard tripPlan={tripPlan} />
      ) : (
        <EmptyState
          icon={Map}
          title="遠征プランがまだありません"
          description="AIが交通手段や宿泊施設、予算目安を提案します。"
          action={<TripPlanGenerateButton eventId={eventId} />}
        />
      )}
    </div>
  )
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getTripPlan, createTripPlan } from '@/lib/firestore/trip-plans'
import { getEvent } from '@/lib/firestore/events'
import { generateTripPlan } from '@/lib/api-client/agent'
import { handleError } from '@/lib/errors'

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const userId = await getUserId()
    const tripPlan = await getTripPlan(eventId, userId)

    return Response.json({ data: tripPlan })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const userId = await getUserId()
    const event = await getEvent(eventId, userId)

    const existing = await getTripPlan(eventId, userId)
    if (existing) {
      return Response.json({ data: existing })
    }

    const result = await generateTripPlan(userId, {
      eventId,
      destination: event.location || '未定',
      startDate: event.startDate,
      endDate: event.endDate || event.startDate,
    })

    const tripPlan = await createTripPlan(userId, {
      eventId,
      ...result.tripPlan,
    })

    return Response.json({ data: tripPlan }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getEvent, updateEventRegistration } from '@/lib/firestore/events'
import { triggerCalendarAgent } from '@/lib/api-client/agent'
import { handleError } from '@/lib/errors'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getUserId()
    const event = await getEvent(id, userId)

    if (event.isRegistered) {
      return Response.json({ data: { message: 'すでに登録済みです' } })
    }

    await triggerCalendarAgent(userId, id)
    await updateEventRegistration(id, userId, true)

    return Response.json({ data: { message: 'カレンダーに登録しました' } })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getEvents } from '@/lib/firestore/events'
import { handleError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const searchParams = request.nextUrl.searchParams

    const oshiId = searchParams.get('oshiId') || undefined
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100

    const events = await getEvents(userId, { oshiId, from, to, limit })

    return Response.json({ data: events })
  } catch (error) {
    return handleError(error)
  }
}

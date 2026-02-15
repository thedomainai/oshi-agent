import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { handleError } from '@/lib/errors'
import { runNetworkScout } from '@/lib/api-client/agent'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    const body = await request.json()
    const { oshiId } = body

    if (!oshiId) {
      return Response.json({ error: 'oshiId is required' }, { status: 400 })
    }

    const result = await runNetworkScout(userId, oshiId)
    return Response.json({ data: result })
  } catch (error) {
    return handleError(error)
  }
}

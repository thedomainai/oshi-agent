import { NextRequest } from 'next/server'
import { handleError, UnauthorizedError } from '@/lib/errors'
import { triggerScoutAgent } from '@/lib/api-client/agent'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CLOUD_SCHEDULER_TOKEN

    if (!expectedToken) {
      throw new Error('CLOUD_SCHEDULER_TOKEN is not configured')
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      throw new UnauthorizedError('無効な認証トークンです')
    }

    const body = await request.json()
    const { userId, oshiId } = body

    if (!userId || !oshiId) {
      throw new Error('userId と oshiId は必須です')
    }

    const result = await triggerScoutAgent(userId, oshiId)

    return Response.json({ data: result })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { handleError, UnauthorizedError } from '@/lib/errors'
import { triggerPriorityAgent } from '@/lib/api-client/agent'

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
    const { userId } = body

    if (!userId) {
      throw new Error('userId は必須です')
    }

    const result = await triggerPriorityAgent(userId)

    return Response.json({ data: result })
  } catch (error) {
    return handleError(error)
  }
}

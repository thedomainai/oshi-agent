import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { handleError } from '@/lib/errors'
import { getNetwork } from '@/lib/api-client/agent'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ oshiId: string }> }
) {
  try {
    const userId = await getUserId()
    const { oshiId } = await params

    const result = await getNetwork(userId, oshiId)
    return Response.json({ data: result })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getInfos } from '@/lib/firestore/infos'
import { handleError } from '@/lib/errors'
import type { Priority } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const searchParams = request.nextUrl.searchParams

    const oshiId = searchParams.get('oshiId') || undefined
    const priority = (searchParams.get('priority') as Priority) || undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0

    const infos = await getInfos(userId, { oshiId, priority, limit, offset })

    return Response.json({ data: infos })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getOshis, createOshi } from '@/lib/firestore/oshis'
import { handleError } from '@/lib/errors'
import { oshiSchema } from '@/lib/utils/validation'
import { triggerSummaryAgent } from '@/lib/api-client/agent'

export async function GET() {
  try {
    const userId = await getUserId()
    const oshis = await getOshis(userId)

    return Response.json({ data: oshis })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    const body = await request.json()

    const validated = oshiSchema.parse(body)
    const oshi = await createOshi(userId, validated)

    // 登録後にバックグラウンドでScout + サマリー生成を実行（結果を待たない）
    triggerSummaryAgent(userId, oshi.id).catch((err) => {
      console.error('Failed to trigger summary agent:', err)
    })

    return Response.json({ data: oshi }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getMonthlyReport } from '@/lib/firestore/expenses'
import { handleError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const searchParams = request.nextUrl.searchParams

    const monthParam = searchParams.get('month')
    const month = monthParam ? new Date(monthParam) : new Date()

    const report = await getMonthlyReport(userId, month)

    return Response.json({ data: report })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getExpenses, createExpense } from '@/lib/firestore/expenses'
import { handleError } from '@/lib/errors'
import { expenseSchema } from '@/lib/utils/validation'
import type { Category } from '@/types/api'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const searchParams = request.nextUrl.searchParams

    const oshiId = searchParams.get('oshiId') || undefined
    const eventId = searchParams.get('eventId') || undefined
    const category = (searchParams.get('category') as Category) || undefined
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100

    const expenses = await getExpenses(userId, { oshiId, eventId, category, from, to, limit })

    return Response.json({ data: expenses })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    const body = await request.json()

    const validated = expenseSchema.parse(body)
    const expense = await createExpense(userId, validated)

    return Response.json({ data: expense }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

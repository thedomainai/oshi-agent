import { getFirestore } from './client'
import type { Expense, ExpenseReport, Category } from '@/types/api'
import { NotFoundError } from '../errors'
import { startOfMonth, endOfMonth, format } from 'date-fns'

const COLLECTION = 'expenses'

interface GetExpensesOptions {
  oshiId?: string
  eventId?: string
  category?: Category
  from?: string
  to?: string
  limit?: number
}

export async function getExpenses(userId: string, options: GetExpensesOptions = {}): Promise<Expense[]> {
  const db = getFirestore()
  const { oshiId, eventId, category, from, to, limit = 100 } = options

  let query = db.collection(COLLECTION).where('userId', '==', userId)

  if (oshiId) {
    query = query.where('oshiId', '==', oshiId)
  }

  if (eventId) {
    query = query.where('eventId', '==', eventId)
  }

  if (category) {
    query = query.where('category', '==', category)
  }

  if (from) {
    query = query.where('date', '>=', from)
  }

  if (to) {
    query = query.where('date', '<=', to)
  }

  query = query.orderBy('date', 'desc')

  if (limit > 0) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[]
}

export async function createExpense(userId: string, data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  const db = getFirestore()
  const now = new Date().toISOString()

  const expenseData = {
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = await db.collection(COLLECTION).add(expenseData)

  return {
    id: docRef.id,
    ...expenseData,
  }
}

export async function getMonthlyReport(userId: string, month: Date): Promise<ExpenseReport> {
  const from = format(startOfMonth(month), 'yyyy-MM-dd')
  const to = format(endOfMonth(month), 'yyyy-MM-dd')

  const expenses = await getExpenses(userId, { from, to, limit: 1000 })

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const byCategory: Record<Category, number> = {
    ticket: 0,
    goods: 0,
    trip: 0,
    other: 0,
  }

  const byOshiMap = new Map<string, { name: string; amount: number }>()

  for (const expense of expenses) {
    byCategory[expense.category] += expense.amount

    if (expense.oshiId) {
      const existing = byOshiMap.get(expense.oshiId)
      if (existing) {
        existing.amount += expense.amount
      } else {
        byOshiMap.set(expense.oshiId, {
          name: expense.oshiId,
          amount: expense.amount,
        })
      }
    }
  }

  const byOshi: Record<string, { name: string; amount: number }> = {}
  byOshiMap.forEach((value, key) => {
    byOshi[key] = value
  })

  return {
    month: format(month, 'yyyy-MM'),
    totalAmount,
    byCategory,
    byOshi,
    expenses,
  }
}

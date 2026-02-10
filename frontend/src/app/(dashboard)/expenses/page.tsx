import { getUserId } from '@/lib/auth/session'
import { getOshis } from '@/lib/firestore/oshis'
import { getExpenses } from '@/lib/firestore/expenses'
import { ExpenseForm } from '@/components/features/expenses/expense-form'
import { ExpenseList } from '@/components/features/expenses/expense-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart } from 'lucide-react'

export default async function ExpensesPage() {
  const userId = await getUserId()
  const oshis = await getOshis(userId)
  const expenses = await getExpenses(userId, { limit: 50 })

  const oshiMap = new Map(oshis.map((oshi) => [oshi.id, oshi.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">支出管理</h1>
          <p className="text-muted-foreground">推し活にかかった費用を記録・管理</p>
        </div>
        <Button asChild>
          <Link href="/expenses/report">
            <BarChart className="h-4 w-4 mr-2" />
            月次レポート
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ExpenseForm oshis={oshis} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">最近の支出</h2>
          <ExpenseList expenses={expenses} oshiMap={oshiMap} />
        </div>
      </div>
    </div>
  )
}

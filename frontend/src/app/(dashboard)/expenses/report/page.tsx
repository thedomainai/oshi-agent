import { getUserId } from '@/lib/auth/session'
import { getOshis } from '@/lib/firestore/oshis'
import { getMonthlyReport } from '@/lib/firestore/expenses'
import { getSettings } from '@/lib/firestore/settings'
import { ExpenseReportCard } from '@/components/features/expenses/expense-report'
import { ExpenseList } from '@/components/features/expenses/expense-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ExpenseReportPage() {
  const userId = await getUserId()
  const oshis = await getOshis(userId)
  const settings = await getSettings(userId)
  const report = await getMonthlyReport(userId, new Date())

  const oshiMap = new Map(oshis.map((oshi) => [oshi.id, oshi.name]))

  const reportWithOshiNames = {
    ...report,
    byOshi: Object.fromEntries(
      Object.entries(report.byOshi).map(([id, data]) => [
        id,
        { ...data, name: oshiMap.get(id) || data.name },
      ])
    ),
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/expenses">
          <ArrowLeft className="h-4 w-4 mr-2" />
          支出管理に戻る
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">月次レポート</h1>
        <p className="text-muted-foreground">今月の推し活支出の概要</p>
      </div>

      <ExpenseReportCard report={reportWithOshiNames} budgetLimit={settings?.budgetLimit} />

      <div>
        <h2 className="text-xl font-semibold mb-4">詳細</h2>
        <ExpenseList expenses={report.expenses} oshiMap={oshiMap} />
      </div>
    </div>
  )
}

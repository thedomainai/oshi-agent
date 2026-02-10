import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ExpenseReport, Category } from '@/types/api'
import { formatCurrency, formatMonth } from '@/lib/utils/format'

interface ExpenseReportProps {
  report: ExpenseReport
  budgetLimit?: number
}

const categoryLabels: Record<Category, string> = {
  ticket: 'チケット',
  goods: 'グッズ',
  trip: '遠征',
  other: 'その他',
}

export function ExpenseReportCard({ report, budgetLimit }: ExpenseReportProps) {
  const budgetPercentage = budgetLimit ? (report.totalAmount / budgetLimit) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatMonth(report.month)}の支出レポート</CardTitle>
        <CardDescription>今月の推し活支出の概要</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-sm font-medium">合計支出</p>
              <p className="text-3xl font-bold">{formatCurrency(report.totalAmount)}</p>
            </div>
            {budgetLimit && (
              <>
                <Progress value={budgetPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  予算上限: {formatCurrency(budgetLimit)} ({budgetPercentage.toFixed(1)}%)
                </p>
              </>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-3">カテゴリ別</p>
            <div className="space-y-2">
              {Object.entries(report.byCategory).map(([category, amount]) => {
                if (amount === 0) return null
                const percentage = (amount / report.totalAmount) * 100

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{categoryLabels[category as Category]}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                )
              })}
            </div>
          </div>

          {Object.keys(report.byOshi).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">推し別</p>
              <div className="space-y-2">
                {Object.entries(report.byOshi).map(([oshiId, data]) => {
                  const percentage = (data.amount / report.totalAmount) * 100

                  return (
                    <div key={oshiId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{data.name}</span>
                        <span className="font-medium">{formatCurrency(data.amount)}</span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

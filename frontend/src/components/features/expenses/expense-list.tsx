import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Expense, Category } from '@/types/api'
import { formatDate, formatCurrency } from '@/lib/utils/format'

interface ExpenseListProps {
  expenses: Expense[]
  oshiMap?: Map<string, string>
}

const categoryLabels: Record<Category, string> = {
  ticket: 'チケット',
  goods: 'グッズ',
  trip: '遠征',
  other: 'その他',
}

const categoryColors: Record<Category, string> = {
  ticket: 'bg-blue-100 text-blue-800 border-blue-300',
  goods: 'bg-purple-100 text-purple-800 border-purple-300',
  trip: 'bg-green-100 text-green-800 border-green-300',
  other: 'bg-gray-100 text-gray-800 border-gray-300',
}

export function ExpenseList({ expenses, oshiMap }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          支出データがありません
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={categoryColors[expense.category]}>
                    {categoryLabels[expense.category]}
                  </Badge>
                  {expense.oshiId && oshiMap && (
                    <span className="text-xs text-muted-foreground">{oshiMap.get(expense.oshiId)}</span>
                  )}
                </div>
                <p className="text-sm font-medium">{expense.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{formatCurrency(expense.amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

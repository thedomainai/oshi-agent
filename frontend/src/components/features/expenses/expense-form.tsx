'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Category, Oshi } from '@/types/api'

interface ExpenseFormProps {
  oshis: Oshi[]
}

export function ExpenseForm({ oshis }: ExpenseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [oshiId, setOshiId] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!category || !amount || !description || !date) {
      setError('必須項目を入力してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oshiId: oshiId || undefined,
          category,
          amount: Number(amount),
          description,
          date,
        }),
      })

      if (!response.ok) {
        throw new Error('支出の登録に失敗しました')
      }

      setOshiId('')
      setCategory('')
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '支出の登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>支出を記録</CardTitle>
        <CardDescription>推し活にかかった費用を記録してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <label htmlFor="oshiId" className="text-sm font-medium">
              推し
            </label>
            <Select value={oshiId} onValueChange={setOshiId}>
              <SelectTrigger id="oshiId">
                <SelectValue placeholder="推しを選択（任意）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">選択しない</SelectItem>
                {oshis.map((oshi) => (
                  <SelectItem key={oshi.id} value={oshi.id}>
                    {oshi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              カテゴリ <span className="text-destructive">*</span>
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ticket">チケット</SelectItem>
                <SelectItem value="goods">グッズ</SelectItem>
                <SelectItem value="trip">遠征</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              金額 <span className="text-destructive">*</span>
            </label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              説明 <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: ライブチケット代"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              日付 <span className="text-destructive">*</span>
            </label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '登録中...' : '登録'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

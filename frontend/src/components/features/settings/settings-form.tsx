'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Settings, Priority } from '@/types/api'

interface SettingsFormProps {
  initialSettings: Settings | null
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notificationEnabled, setNotificationEnabled] = useState(initialSettings?.notificationEnabled ?? true)
  const [emailNotification, setEmailNotification] = useState(initialSettings?.emailNotification ?? false)
  const [priorityThreshold, setPriorityThreshold] = useState<Priority>(
    initialSettings?.priorityThreshold ?? 'important'
  )
  const [budgetLimit, setBudgetLimit] = useState(initialSettings?.budgetLimit?.toString() ?? '')
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(
    initialSettings?.budgetAlertThreshold?.toString() ?? '80'
  )
  const [calendarSync, setCalendarSync] = useState(initialSettings?.calendarSync ?? false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationEnabled,
          emailNotification,
          priorityThreshold,
          budgetLimit: budgetLimit ? Number(budgetLimit) : undefined,
          budgetAlertThreshold: budgetAlertThreshold ? Number(budgetAlertThreshold) : undefined,
          calendarSync,
        }),
      })

      if (!response.ok) {
        throw new Error('設定の保存に失敗しました')
      }

      router.refresh()
      alert('設定を保存しました')
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <CardDescription>情報収集時の通知設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="notificationEnabled" className="text-sm font-medium">
              通知を有効化
            </label>
            <input
              id="notificationEnabled"
              type="checkbox"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="emailNotification" className="text-sm font-medium">
              メール通知
            </label>
            <input
              id="emailNotification"
              type="checkbox"
              checked={emailNotification}
              onChange={(e) => setEmailNotification(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="priorityThreshold" className="text-sm font-medium">
              通知する優先度の閾値
            </label>
            <Select value={priorityThreshold} onValueChange={(v) => setPriorityThreshold(v as Priority)}>
              <SelectTrigger id="priorityThreshold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">緊急のみ</SelectItem>
                <SelectItem value="important">注目以上</SelectItem>
                <SelectItem value="normal">すべて</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>予算管理</CardTitle>
          <CardDescription>月間予算と警告の設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="budgetLimit" className="text-sm font-medium">
              月間予算上限（円）
            </label>
            <Input
              id="budgetLimit"
              type="number"
              min="0"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="50000"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="budgetAlertThreshold" className="text-sm font-medium">
              警告閾値（%）
            </label>
            <Input
              id="budgetAlertThreshold"
              type="number"
              min="0"
              max="100"
              value={budgetAlertThreshold}
              onChange={(e) => setBudgetAlertThreshold(e.target.value)}
              placeholder="80"
            />
            <p className="text-xs text-muted-foreground">予算の何%で警告を表示するか</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>カレンダー連携</CardTitle>
          <CardDescription>Googleカレンダーとの同期設定</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <label htmlFor="calendarSync" className="text-sm font-medium">
              自動同期を有効化
            </label>
            <input
              id="calendarSync"
              type="checkbox"
              checked={calendarSync}
              onChange={(e) => setCalendarSync(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? '保存中...' : '設定を保存'}
      </Button>
    </form>
  )
}

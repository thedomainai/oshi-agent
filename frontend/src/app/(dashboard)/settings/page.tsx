import { getUserId } from '@/lib/auth/session'
import { getSettings } from '@/lib/firestore/settings'
import { SettingsForm } from '@/components/features/settings/settings-form'

export default async function SettingsPage() {
  const userId = await getUserId()
  const settings = await getSettings(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">設定</h1>
        <p className="text-muted-foreground">アプリケーションの設定を管理</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}

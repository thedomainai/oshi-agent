import Link from 'next/link'
import { getUserId } from '@/lib/auth/session'
import { getOshis } from '@/lib/firestore/oshis'
import { getAlertInfos, getInfoCount, getInfos } from '@/lib/firestore/infos'
import { AlertBanner } from '@/components/features/dashboard/alert-banner'
import { DashboardStats } from '@/components/features/dashboard/dashboard-stats'
import { NetworkSection } from '@/components/features/network/network-section'
import { TimelineItem } from '@/components/features/timeline/timeline-item'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart } from 'lucide-react'

export default async function DashboardPage() {
  const userId = await getUserId()
  const oshis = await getOshis(userId)

  if (oshis.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
          <p className="text-muted-foreground">推し活の「見逃し」をゼロにするAIマネージャー</p>
        </div>
        <EmptyState
          icon={Heart}
          title="推しを登録して始めましょう"
          description="推しの名前を登録すると、AIが自動的に情報を収集し、チケット販売やイベント告知など、見逃したら困る情報をお届けします。"
          action={
            <Link href="/oshi/new">
              <Button>推しを登録する</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const [alertInfos, infoCount, recentInfos] = await Promise.all([
    getAlertInfos(userId),
    getInfoCount(userId),
    getInfos(userId, { limit: 5 }),
  ])

  const oshiMap = new Map(oshis.map((o) => [o.id, o.name]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-muted-foreground">推し活の「見逃し」をゼロにするAIマネージャー</p>
      </div>

      <AlertBanner
        urgentInfos={alertInfos.urgent}
        importantInfos={alertInfos.important}
        oshis={oshis}
      />

      <DashboardStats
        oshiCount={oshis.length}
        totalInfos={infoCount.total}
        alertsCaught={infoCount.urgent + infoCount.important}
      />

      {/* 推しネットワーク（最初の推しを表示） */}
      <NetworkSection oshiId={oshis[0].id} oshiName={oshis[0].name} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新の情報</h2>
          <Link href="/timeline" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            すべて見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentInfos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            まだ情報が収集されていません。AIが自動的に情報を収集するまでお待ちください。
          </p>
        ) : (
          <div className="space-y-4">
            {recentInfos.map((info) => (
              <TimelineItem key={info.id} info={info} oshiName={oshiMap.get(info.oshiId)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

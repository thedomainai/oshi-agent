import { Card, CardContent } from '@/components/ui/card'
import { Heart, Network, Newspaper, Shield } from 'lucide-react'

interface DashboardStatsProps {
  oshiCount: number
  totalInfos: number
  alertsCaught: number
  networkNodes?: number
}

export function DashboardStats({ oshiCount, totalInfos, alertsCaught, networkNodes }: DashboardStatsProps) {
  const stats = [
    {
      label: '登録中の推し',
      value: `${oshiCount}人`,
      icon: Heart,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950',
    },
    {
      label: '監視ネットワーク',
      value: `${networkNodes ?? 0}ノード`,
      icon: Network,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950',
    },
    {
      label: '収集した情報',
      value: `${totalInfos}件`,
      icon: Newspaper,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: '見逃し防止',
      value: `${alertsCaught}件`,
      icon: Shield,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="py-4 flex items-center gap-4">
              <div className={`rounded-full p-2.5 ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

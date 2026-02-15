'use client'

import { useEffect, useState, useRef } from 'react'

const DEMO_ALERTS = [
  {
    priority: 'urgent' as const,
    title: 'ファンクラブ先行チケット受付開始',
    detail: '締切: 2月20日 18:00',
    source: '速報アカウント',
    time: '2分前',
  },
  {
    priority: 'urgent' as const,
    title: '限定コラボグッズ 本日発売開始',
    detail: 'オンラインショップにて数量限定',
    source: 'まとめ情報',
    time: '15分前',
  },
  {
    priority: 'important' as const,
    title: 'スタイリストが新衣装の写真を投稿',
    detail: 'MV撮影か？ 新ビジュアル解禁の可能性',
    source: 'スタイリスト',
    time: '1時間前',
  },
  {
    priority: 'important' as const,
    title: '全国ツアー2026 追加公演決定',
    detail: '東京ドーム 6月15日(日)',
    source: '事務所 公式',
    time: '3時間前',
  },
  {
    priority: 'normal' as const,
    title: 'メンバーAがリハーサル写真を投稿',
    detail: 'レコーディングスタジオからの投稿',
    source: 'メンバーA',
    time: '5時間前',
  },
]

const PRIORITY_CONFIG = {
  urgent: {
    label: '緊急',
    emoji: '\uD83D\uDD34',
    className: 'lp-badge-urgent',
  },
  important: {
    label: '注目',
    emoji: '\uD83D\uDFE1',
    className: 'lp-badge-important',
  },
  normal: {
    label: '日常',
    emoji: '\uD83D\uDFE2',
    className: 'lp-badge-normal',
  },
}

export function DemoMockup() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    if (visibleCount >= DEMO_ALERTS.length) return

    const timer = setTimeout(
      () => setVisibleCount((c) => c + 1),
      visibleCount === 0 ? 500 : 600
    )
    return () => clearTimeout(timer)
  }, [isVisible, visibleCount])

  return (
    <div ref={ref} className="w-full max-w-lg mx-auto">
      {/* Mock browser chrome */}
      <div className="lp-glass rounded-xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-white/30 font-mono">
              oshi-agent.app/dashboard
            </span>
          </div>
        </div>

        {/* Dashboard header */}
        <div className="px-5 pt-4 pb-3">
          <div className="text-sm font-semibold text-white/80">
            ダッシュボード
          </div>
          <div className="text-xs text-white/30 mt-0.5">
            ネットワーク内12ノードから自動収集
          </div>
        </div>

        {/* Alert list */}
        <div className="px-4 pb-4 space-y-2">
          {DEMO_ALERTS.map((alert, i) => {
            const config = PRIORITY_CONFIG[alert.priority]
            const show = i < visibleCount

            return (
              <div
                key={i}
                className="transition-all duration-500"
                style={{
                  opacity: show ? 1 : 0,
                  transform: show ? 'translateY(0)' : 'translateY(12px)',
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div
                  className={`rounded-lg px-3.5 py-2.5 ${
                    alert.priority === 'urgent'
                      ? 'bg-red-500/[0.07] border border-red-500/20'
                      : alert.priority === 'important'
                        ? 'bg-yellow-500/[0.05] border border-yellow-500/10'
                        : 'bg-white/[0.02] border border-white/5'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-sm mt-0.5">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] text-white/20">
                          {alert.time}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-white/80 mt-1">
                        {alert.title}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        <span className="text-cyan-400/50">via {alert.source}</span>
                        {' · '}
                        {alert.detail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import './lp.css'

export const metadata: Metadata = {
  title: 'オシエージェント - 推しの情報、もう追いかけなくていい。',
  description:
    '6体のAIエージェントが24時間、あなたの推しを見守り続ける。情報収集・重要度判定・カレンダー登録・遠征計画・予算管理をすべて自動化。',
  openGraph: {
    title: 'オシエージェント - AI推し活マネージャー',
    description: '推しの情報、もう追いかけなくていい。6体のAIが24時間見守る。',
    type: 'website',
  },
}

export default function LPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#06060f] text-white antialiased min-h-screen">
      {children}
    </div>
  )
}

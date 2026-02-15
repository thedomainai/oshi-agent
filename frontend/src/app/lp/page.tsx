import { HeroParticles } from './components/hero-particles'
import { ScrollReveal } from './components/scroll-reveal'
import { OshiNetworkGraph } from './components/oshi-network-graph'
import { AgentConstellation } from './components/agent-constellation'
import { DemoMockup } from './components/demo-mockup'
import { AnimatedCounter } from './components/animated-counter'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Gradient Mesh Background */}
      <div className="lp-mesh-bg" aria-hidden="true">
        <div className="lp-mesh-orb-purple" />
      </div>

      {/* Particles */}
      <HeroParticles />

      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <PainSection />
        <SolutionSection />
        <NetworkSection />
        <AgentsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TechSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}

/* ============================================================
   Navigation
   ============================================================ */
function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,45,120,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(255,45,120,0.3)',
            }}
          >
            推
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Oshi Agent
          </span>
        </div>
        <a
          href="/login"
          className="text-xs px-4 py-2 rounded-full lp-glass lp-glass-hover text-white/70 hover:text-white transition-colors"
        >
          ログイン
        </a>
      </div>
    </nav>
  )
}

/* ============================================================
   Section 1: Hero
   ============================================================ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <ScrollReveal delay={200}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full lp-glass text-xs text-white/50 mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
            />
            6体のAIエージェントが稼働中
          </div>
        </ScrollReveal>

        {/* Main Heading */}
        <ScrollReveal delay={400}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="lp-hero-heading">
              推しの情報、
              <br />
              もう追いかけなくていい。
            </span>
          </h1>
        </ScrollReveal>

        {/* Sub heading */}
        <ScrollReveal delay={600}>
          <p className="text-base sm:text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-10">
            公式情報だけじゃない。関係者、ファンの速報、周辺情報まで——
            <br className="hidden sm:block" />
            AIが
            <span className="text-white/60">推しのネットワーク全体</span>
            を自動で発見し、24時間見守り続ける。
          </p>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal delay={800}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/login"
              className="group relative px-8 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ff2d78, #8b5cf6)',
              }}
            >
              <span className="relative z-10">今すぐ始める</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #ff4d8e, #a78bfa)',
                }}
              />
            </a>
            <a
              href="#network"
              className="px-8 py-3.5 rounded-full text-sm text-white/60 lp-glass lp-glass-hover hover:text-white"
            >
              推しネットワークとは
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lp-scroll-indicator">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

/* ============================================================
   Section 2: Pain Point
   ============================================================ */
function PainSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="text-center text-sm tracking-widest text-red-400/60 uppercase mb-4">
            The Problem
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center leading-tight mb-6">
            <span className="text-red-400/90">あの日、</span>
            <br />
            先行受付を見逃した。
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="text-center text-white/35 max-w-xl mx-auto leading-relaxed mb-16">
            チケットは完売。転売価格は3倍。
            <br />
            公式だけじゃない。スタッフの匂わせ投稿、ファンの速報、関連アカウント——
            <br />
            <span className="text-white/50">
              追うべき情報源は無限に広がっていく。
            </span>
          </p>
        </ScrollReveal>

        {/* Pain cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-20">
          {[
            {
              icon: '💔',
              title: 'チケット先行を見逃した',
              desc: 'FC先行の締切を知らなかった。一般販売は秒で完売。',
            },
            {
              icon: '😰',
              title: '限定グッズが完売していた',
              desc: '気づいたときには在庫ゼロ。再販未定。',
            },
            {
              icon: '🕸️',
              title: '関係者の投稿まで追えない',
              desc: 'スタイリスト、カメラマン、共演者…。前兆はそこにあったのに。',
            },
            {
              icon: '😮‍💨',
              title: 'ファンの速報に気づけない',
              desc: '情報通のファンは知っていた。自分だけが知らなかった。',
            },
          ].map((card, i) => (
            <ScrollReveal key={i} delay={500 + i * 100}>
              <div className="lp-glass rounded-xl p-5 lp-glass-hover">
                <span className="text-2xl mb-3 block">{card.icon}</span>
                <h3 className="text-sm font-semibold text-white/80 mb-1.5">
                  {card.title}
                </h3>
                <p className="text-xs text-white/35 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { value: 1384, suffix: '万人', label: '推し活人口' },
            { value: 35000, suffix: '億円', label: '市場規模' },
            { value: 5, suffix: '箇所+', label: '平均情報源数' },
          ].map((stat, i) => (
            <ScrollReveal key={i} delay={600 + i * 150}>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent"
                  />
                </div>
                <div className="text-xs text-white/30 mt-1">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Section 3: Solution Reveal
   ============================================================ */
function SolutionSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="lp-section-divider mb-32" />

      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-sm tracking-widest text-blue-400/60 uppercase mb-4">
            The Solution
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              もう、見逃さない。
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed mb-8">
            推しの名前を入力するだけで、AIが
            <span className="text-white/60">関連する人物・組織・ファンコミュニティ</span>
            を自動発見。
            <br />
            構築されたネットワーク全体を24時間巡回し、重要情報をアラートする。
          </p>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/30">
            <span className="px-3 py-1.5 rounded-full lp-glass">
              ネットワーク自動構築
            </span>
            <span className="px-3 py-1.5 rounded-full lp-glass">
              関係者・ファンも巡回
            </span>
            <span className="px-3 py-1.5 rounded-full lp-glass">
              ファン目線で重要度判定
            </span>
            <span className="px-3 py-1.5 rounded-full lp-glass">
              カレンダー自動登録
            </span>
            <span className="px-3 py-1.5 rounded-full lp-glass">
              遠征プラン自動生成
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ============================================================
   Section 4: Oshi Network - Core Differentiator
   ============================================================ */
function NetworkSection() {
  return (
    <section id="network" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-center text-sm tracking-widest text-cyan-400/60 uppercase mb-4">
            Oshi Network
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            推しのネットワークを、
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AIが自動で構築する。
            </span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <p className="text-center text-white/35 max-w-2xl mx-auto mb-16 leading-relaxed">
            推しの名前から出発して、メンバー、スタッフ、事務所、ファンコミュニティ、
            関連メディアまで——AIが関連ノードを自律的に探索・発見。
            構築されたネットワーク全体から情報を収集し続ける。
          </p>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Network Graph */}
          <ScrollReveal variant="scale" delay={400} className="flex-shrink-0">
            <OshiNetworkGraph />
          </ScrollReveal>

          {/* Explanation */}
          <div className="flex-1 max-w-md">
            {[
              {
                ring: '本人',
                color: '#ff2d78',
                desc: '推し本人の公式サイト・SNSを起点に探索を開始',
              },
              {
                ring: '関係者',
                color: '#3b82f6',
                desc: 'グループメンバー、マネージャー、スタイリスト、プロデューサーなど推しに直接関わる人物を自動特定',
              },
              {
                ring: '周辺',
                color: '#10b981',
                desc: 'ファンの速報アカウント、まとめ情報、会場情報、コラボ先、メディアなど広域ネットワークまで拡張',
              },
            ].map((layer, i) => (
              <ScrollReveal key={i} delay={600 + i * 150}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: `${layer.color}15`,
                          border: `1px solid ${layer.color}30`,
                          color: layer.color,
                        }}
                      >
                        {layer.ring}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {layer.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            <ScrollReveal delay={1050}>
              <div className="lp-glass rounded-lg p-4 mt-4">
                <p className="text-[11px] text-white/30 leading-relaxed">
                  <span className="text-cyan-400/60 font-medium">自動拡張:</span>{' '}
                  ネットワークは固定ではありません。AIが新しい関連人物や情報源を発見するたび、
                  自動的にノードが追加され、巡回範囲が広がっていきます。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Section 5: Agent Architecture
   ============================================================ */
function AgentsSection() {
  const agents = [
    {
      name: 'Scout Agent',
      label: '探索・収集',
      desc: '推しネットワーク全体を24時間自律巡回。関連人物の発見からWeb検索まで、情報収集の最前線。',
      color: '#3b82f6',
    },
    {
      name: 'Priority Agent',
      label: '重要度判定',
      desc: '「見逃したら致命的」な情報を Gemini が自動判定。ネットワーク内の前兆シグナルも検知。',
      color: '#ef4444',
    },
    {
      name: 'Calendar Agent',
      label: '予定管理',
      desc: 'イベント日程を検出し Google Calendar に自動登録。「知っていたのに忘れた」を防止。',
      color: '#f59e0b',
    },
    {
      name: 'Trip Agent',
      label: '遠征計画',
      desc: 'Google Maps で最適ルートを算出。交通費・宿泊費の概算を含む遠征プランを自動生成。',
      color: '#10b981',
    },
    {
      name: 'Budget Agent',
      label: '予算管理',
      desc: '推し活の支出を可視化。カテゴリ別集計と月次レポートで「使いすぎ」を未然に防止。',
      color: '#8b5cf6',
    },
    {
      name: 'Root Agent',
      label: '統括制御',
      desc: 'ADK オーケストレーターとして全エージェントを統括。ワークフロー制御と障害の局所化。',
      color: '#ec4899',
    },
  ]

  return (
    <section className="relative py-32 px-6">
      <div className="lp-section-divider mb-32" />

      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-center text-sm tracking-widest text-purple-400/60 uppercase mb-4">
            Multi-Agent Architecture
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            6体のAIが、ネットワーク全体を守る。
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <p className="text-center text-white/35 max-w-lg mx-auto mb-16">
            それぞれが専門の責務を持ち、協調して動く。
            <br />
            1体が止まっても、他の5体は稼働し続ける。
          </p>
        </ScrollReveal>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <ScrollReveal variant="scale" delay={400} className="flex-shrink-0">
            <AgentConstellation />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {agents.map((agent, i) => (
              <ScrollReveal key={i} delay={500 + i * 80}>
                <div className="lp-glass rounded-xl p-4 lp-glass-hover group">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                      style={{ background: agent.color }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-white/70">
                        {agent.name}
                      </span>
                      <span className="text-[10px] text-white/30 ml-2">
                        {agent.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/30 leading-relaxed pl-5">
                    {agent.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Section 6: How It Works
   ============================================================ */
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: '推しの名前を入力',
      desc: 'アーティスト名を入力するだけ。カテゴリ（アイドル/アーティスト/VTuber等）の指定で探索精度が向上。',
      visual: (
        <div className="lp-glass rounded-lg p-4">
          <div className="text-[10px] text-white/30 mb-2">推しを登録</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 rounded-md bg-white/5 border border-white/10 flex items-center px-3">
              <span className="text-xs text-white/50">推しの名前...</span>
              <span className="lp-cursor" />
            </div>
            <div className="h-9 px-4 rounded-md bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center">
              <span className="text-[11px] text-pink-300">登録</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: '02',
      title: 'AIがネットワークを自動構築',
      desc: 'Gemini がメンバー、スタッフ、ファンアカウント等の関連ノードを自動特定。推しのネットワーク地図が出来上がる。',
      visual: (
        <div className="lp-glass rounded-lg p-4">
          <div className="flex items-center gap-2 text-[10px] text-white/30 mb-3">
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              style={{ animation: 'pulse-glow 1.5s ease-in-out infinite' }}
            />
            ネットワーク構築中...
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'メンバー3名', status: 'done' },
              { name: 'スタッフ4名', status: 'done' },
              { name: 'ファンアカウント2件', status: 'done' },
              { name: '関連メディア', status: 'scanning' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={`w-1 h-1 rounded-full ${
                    item.status === 'done' ? 'bg-green-400' : 'bg-cyan-400'
                  }`}
                  style={
                    item.status === 'scanning'
                      ? { animation: 'pulse-glow 1s ease-in-out infinite' }
                      : undefined
                  }
                />
                <span className="text-[10px] text-white/40">{item.name}</span>
                <span className="text-[9px] text-white/20">
                  {item.status === 'done' ? '発見' : '探索中...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: 'ネットワーク全体を24時間巡回',
      desc: 'Scout Agent がネットワーク上の全ノードから情報を収集。Priority Agent が重要度を判定し、緊急情報をアラート。',
      visual: (
        <div className="lp-glass rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
            <span className="text-xs">🔴</span>
            <div>
              <div className="text-[10px] font-medium text-red-300">
                FC先行チケット受付中
              </div>
              <div className="text-[9px] text-white/30">
                <span className="text-cyan-400/50">via 速報アカウント</span>{' '}
                · 締切: 明後日 18:00
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-yellow-500/5 border border-yellow-500/10 px-3 py-2">
            <span className="text-xs">🟡</span>
            <div>
              <div className="text-[10px] font-medium text-yellow-300">
                スタイリストが衣装写真を投稿
              </div>
              <div className="text-[9px] text-white/30">
                <span className="text-cyan-400/50">via スタイリスト</span>{' '}
                · 新ビジュアル解禁の可能性
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="lp-section-divider mb-32" />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-center text-sm tracking-widest text-green-400/60 uppercase mb-4">
            How It Works
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            あなたがやることは、ひとつだけ。
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <p className="text-center text-white/35 mb-16">
            推しの名前を教えてください。ネットワーク構築から巡回まで、すべてAIに任せて。
          </p>
        </ScrollReveal>

        <div className="space-y-12">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={400 + i * 150}>
              <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl font-bold bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent">
                      {step.step}
                    </span>
                    <h3 className="text-xl font-semibold text-white/80">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed pl-16 md:pl-[72px]">
                    {step.desc}
                  </p>
                </div>
                <div className="w-full md:w-80 flex-shrink-0">{step.visual}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Section 7: Features - Live Demo Mockup
   ============================================================ */
function FeaturesSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="lp-section-divider mb-32" />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-center text-sm tracking-widest text-pink-400/60 uppercase mb-4">
            Dashboard Preview
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            開くだけで、全部わかる。
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <p className="text-center text-white/35 max-w-lg mx-auto mb-16">
            ネットワーク全体から収集・分類された情報がダッシュボードに集約。
            <br />
            どのノードから見つかった情報かも一目でわかる。
          </p>
        </ScrollReveal>

        <ScrollReveal variant="scale" delay={500}>
          <DemoMockup />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
          {[
            {
              icon: '🕸️',
              label: 'ネットワーク巡回',
              desc: '推し本人だけでなく関係者・ファンの情報も自動収集',
            },
            {
              icon: '🔴',
              label: '前兆検知',
              desc: '関係者の投稿から公式発表前の前兆シグナルをキャッチ',
            },
            {
              icon: '🗺️',
              label: '遠征プラン',
              desc: '交通・宿泊・費用を自動で算出',
            },
          ].map((feat, i) => (
            <ScrollReveal key={i} delay={600 + i * 100}>
              <div className="lp-glass rounded-xl p-5 text-center lp-glass-hover">
                <span className="text-2xl mb-3 block">{feat.icon}</span>
                <h3 className="text-sm font-semibold text-white/70 mb-1">
                  {feat.label}
                </h3>
                <p className="text-[11px] text-white/30 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Section 8: Tech Stack
   ============================================================ */
function TechSection() {
  const techGroups = [
    {
      category: 'AI',
      color: '#8b5cf6',
      items: ['Gemini 2.0 Flash', 'ADK (Agent Development Kit)'],
    },
    {
      category: 'Compute',
      color: '#3b82f6',
      items: ['Cloud Run (2コンテナ)', 'Cloud Scheduler'],
    },
    {
      category: 'Data',
      color: '#f59e0b',
      items: ['Firestore'],
    },
    {
      category: 'API',
      color: '#10b981',
      items: ['Google Custom Search', 'Google Calendar', 'Google Maps'],
    },
    {
      category: 'Frontend',
      color: '#ec4899',
      items: ['Next.js 15', 'React 19', 'Tailwind CSS'],
    },
    {
      category: 'Backend',
      color: '#06b6d4',
      items: ['Python 3.11', 'FastAPI', 'Pydantic v2'],
    },
  ]

  return (
    <section className="relative py-32 px-6">
      <div className="lp-section-divider mb-32" />

      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <p className="text-center text-sm tracking-widest text-cyan-400/60 uppercase mb-4">
            Tech Stack
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Google Cloud で完全自律稼働
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <p className="text-center text-white/35 max-w-lg mx-auto mb-16">
            7つの Google Cloud サービスを活用。
            <br />
            Cloud Run の自動スケーリングにより、1ユーザーあたり月額約5円で運用可能。
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {techGroups.map((group, i) => (
            <ScrollReveal key={i} delay={400 + i * 80}>
              <div className="lp-glass rounded-xl p-4 lp-glass-hover">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: group.color }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    {group.category}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item, j) => (
                    <div key={j} className="text-xs text-white/40 leading-relaxed">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={800}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-2 text-[10px] text-white/25">
            <span className="px-3 py-1.5 rounded-full border border-white/10">
              ユーザー
            </span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-full border border-pink-500/20 text-pink-300/50">
              Next.js (BFF)
            </span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-full border border-blue-500/20 text-blue-300/50">
              FastAPI + ADK
            </span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-full border border-purple-500/20 text-purple-300/50">
              Gemini / Google APIs
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ============================================================
   Section 9: CTA
   ============================================================ */
function CTASection() {
  return (
    <section className="relative py-32 px-6">
      <div className="lp-section-divider mb-32" />

      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              推し活の不安を、
              <br />
              安心に変えよう。
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-white/35 mb-10 leading-relaxed">
            推しの名前を登録するだけ。
            <br />
            AIがネットワークを構築し、あなたの推し活を守り続けます。
          </p>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <a
            href="/login"
            className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-full text-base font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #ff2d78, #8b5cf6)',
            }}
          >
            <span className="relative z-10">無料で始める</span>
            <svg
              className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, #ff4d8e, #a78bfa)',
              }}
            />
          </a>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <p className="text-[11px] text-white/20 mt-6">
            Google アカウントで簡単ログイン
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ============================================================
   Footer
   ============================================================ */
function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(255,45,120,0.2)',
            }}
          >
            推
          </div>
          <span className="text-xs text-white/30">Oshi Agent</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] text-white/20">
          <span>
            Built for{' '}
            <span className="text-white/40">
              Agentic AI Hackathon with Google Cloud
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/thedomainai/oshi-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white/50 transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}

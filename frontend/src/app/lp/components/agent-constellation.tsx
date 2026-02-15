'use client'

import { useEffect, useRef, useState } from 'react'

const AGENTS = [
  { name: 'Scout', label: '情報収集', color: '#3b82f6', angle: -90 },
  { name: 'Priority', label: '重要度判定', color: '#ef4444', angle: -30 },
  { name: 'Calendar', label: '予定管理', color: '#f59e0b', angle: 30 },
  { name: 'Trip', label: '遠征計画', color: '#10b981', angle: 90 },
  { name: 'Budget', label: '予算管理', color: '#8b5cf6', angle: 150 },
  { name: 'Root', label: '統括制御', color: '#ec4899', angle: 210 },
]

export function AgentConstellation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeAgent, setActiveAgent] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-cycle through agents
  useEffect(() => {
    if (!isVisible) return
    const timer = setInterval(() => {
      setActiveAgent((prev) => {
        if (prev === null) return 0
        return (prev + 1) % AGENTS.length
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [isVisible])

  const radius = 160

  return (
    <div
      ref={containerRef}
      className="relative w-[400px] h-[400px] mx-auto"
      role="img"
      aria-label="6体のAIエージェントが推しを中心に守護するコンステレーション図"
    >
      {/* Orbit rings */}
      <div
        className="absolute inset-[40px] rounded-full lp-orbit-ring"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease 0.3s',
        }}
      />
      <div
        className="absolute inset-[80px] rounded-full lp-orbit-ring"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease 0.5s',
          animationDelay: '1s',
        }}
      />

      {/* Connection lines (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.2s ease 0.8s',
        }}
      >
        {AGENTS.map((agent, i) => {
          const x = 200 + radius * Math.cos((agent.angle * Math.PI) / 180)
          const y = 200 + radius * Math.sin((agent.angle * Math.PI) / 180)
          return (
            <line
              key={`line-${i}`}
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              stroke={activeAgent === i ? agent.color : 'rgba(255,255,255,0.06)'}
              strokeWidth={activeAgent === i ? 1.5 : 0.5}
              strokeDasharray={activeAgent === i ? 'none' : '4 4'}
              style={{ transition: 'all 0.5s ease' }}
            />
          )
        })}
        {/* Cross-connections between adjacent agents */}
        {AGENTS.map((agent, i) => {
          const next = AGENTS[(i + 1) % AGENTS.length]
          const x1 = 200 + radius * Math.cos((agent.angle * Math.PI) / 180)
          const y1 = 200 + radius * Math.sin((agent.angle * Math.PI) / 180)
          const x2 = 200 + radius * Math.cos((next.angle * Math.PI) / 180)
          const y2 = 200 + radius * Math.sin((next.angle * Math.PI) / 180)
          return (
            <line
              key={`cross-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.5"
            />
          )
        })}
      </svg>

      {/* Center node: "推し" */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.5})`,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        }}
      >
        <div className="relative">
          {/* Pulse rings */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(255, 45, 120, 0.15)',
              animation: isVisible
                ? 'pulse-ring 3s ease-out infinite'
                : 'none',
            }}
          />
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,45,120,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(255,45,120,0.4)',
              boxShadow: '0 0 30px rgba(255,45,120,0.3)',
            }}
          >
            <span className="text-lg font-bold text-white">推し</span>
          </div>
        </div>
      </div>

      {/* Agent nodes */}
      {AGENTS.map((agent, i) => {
        const x = 200 + radius * Math.cos((agent.angle * Math.PI) / 180)
        const y = 200 + radius * Math.sin((agent.angle * Math.PI) / 180)
        const isActive = activeAgent === i

        return (
          <div
            key={agent.name}
            className="absolute z-10 flex flex-col items-center gap-1 cursor-pointer"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.6s ease ${0.4 + i * 0.15}s, transform 0.3s ease`,
            }}
            onMouseEnter={() => setActiveAgent(i)}
          >
            {/* Node circle */}
            <div className="relative">
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `${agent.color}33`,
                    animation: 'pulse-ring 2s ease-out infinite',
                  }}
                />
              )}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isActive
                    ? `${agent.color}40`
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? `${agent.color}80` : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: isActive
                    ? `0 0 20px ${agent.color}40`
                    : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <AgentIcon name={agent.name} color={isActive ? agent.color : '#888'} />
              </div>
            </div>
            {/* Label */}
            <div className="text-center whitespace-nowrap">
              <div
                className="text-[10px] font-medium transition-colors duration-300"
                style={{ color: isActive ? agent.color : '#666' }}
              >
                {agent.name}
              </div>
              <div
                className="text-[9px] transition-colors duration-300"
                style={{ color: isActive ? '#ccc' : '#555' }}
              >
                {agent.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AgentIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    Scout: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    Priority:
      'M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.97L13.75 4a2 2 0 00-3.5 0L3.32 16.03A2 2 0 005.07 19z',
    Calendar:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    Trip: 'M9 20l-5.45-2.73A2 2 0 013 15.57V6.43a1 1 0 011.55-.83L9 8m0 12l6-3m-6 3V8m6 9l5.45 2.73A1 1 0 0021 18.57V9.43a2 2 0 00-1.05-1.76L15 5m0 12V5m0 0L9 8',
    Budget:
      'M12 8c-1.1 0-2 .45-2 1s.9 1 2 1 2 .45 2 1-.9 1-2 1m0-6v1m0 8v1m9-5a9 9 0 11-18 0 9 9 0 0118 0z',
    Root: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name] || ''} />
    </svg>
  )
}

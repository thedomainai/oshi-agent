'use client'

import { useEffect, useRef, useState } from 'react'

interface NetworkNode {
  id: string
  name: string
  type: string
  ring: number
  angle: number
  color: string
}

const TYPE_COLORS: Record<string, string> = {
  oshi: '#ff2d78',
  member: '#3b82f6',
  org: '#f59e0b',
  staff: '#06b6d4',
  fan: '#10b981',
  venue: '#8b5cf6',
  collab: '#f97316',
  media: '#14b8a6',
}

const RING1_NODES: NetworkNode[] = [
  { id: 'member1', name: 'メンバーA', type: 'member', ring: 1, angle: 0, color: TYPE_COLORS.member },
  { id: 'member2', name: 'メンバーB', type: 'member', ring: 1, angle: 60, color: TYPE_COLORS.member },
  { id: 'agency', name: '事務所', type: 'org', ring: 1, angle: 120, color: TYPE_COLORS.org },
  { id: 'producer', name: 'プロデューサー', type: 'staff', ring: 1, angle: 180, color: TYPE_COLORS.staff },
  { id: 'stylist', name: 'スタイリスト', type: 'staff', ring: 1, angle: 240, color: TYPE_COLORS.staff },
  { id: 'label', name: 'レーベル', type: 'org', ring: 1, angle: 300, color: TYPE_COLORS.org },
]

const RING2_NODES: NetworkNode[] = [
  { id: 'fan1', name: '速報アカウント', type: 'fan', ring: 2, angle: 30, color: TYPE_COLORS.fan },
  { id: 'fan2', name: 'まとめ情報', type: 'fan', ring: 2, angle: 90, color: TYPE_COLORS.fan },
  { id: 'venue', name: '会場', type: 'venue', ring: 2, angle: 150, color: TYPE_COLORS.venue },
  { id: 'camera', name: 'カメラマン', type: 'staff', ring: 2, angle: 210, color: TYPE_COLORS.staff },
  { id: 'collab', name: 'コラボ先', type: 'collab', ring: 2, angle: 270, color: TYPE_COLORS.collab },
  { id: 'media', name: 'メディア', type: 'media', ring: 2, angle: 330, color: TYPE_COLORS.media },
]

const ALL_NODES = [...RING1_NODES, ...RING2_NODES]

const RING1_RADIUS = 120
const RING2_RADIUS = 200
const CENTER = 240

function getNodePos(node: NetworkNode) {
  const r = node.ring === 1 ? RING1_RADIUS : RING2_RADIUS
  const rad = (node.angle * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

export function OshiNetworkGraph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [discoveredCount, setDiscoveredCount] = useState(0)
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [pulseNode, setPulseNode] = useState<string | null>(null)

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
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Progressive node discovery animation
  useEffect(() => {
    if (!isVisible) return
    if (discoveredCount >= ALL_NODES.length) return

    const timer = setTimeout(
      () => {
        setDiscoveredCount((c) => c + 1)
        setPulseNode(ALL_NODES[discoveredCount]?.id ?? null)
      },
      discoveredCount === 0 ? 800 : 300
    )
    return () => clearTimeout(timer)
  }, [isVisible, discoveredCount])

  // Clear pulse after a moment
  useEffect(() => {
    if (!pulseNode) return
    const timer = setTimeout(() => setPulseNode(null), 600)
    return () => clearTimeout(timer)
  }, [pulseNode])

  // Auto-cycle highlight
  useEffect(() => {
    if (discoveredCount < ALL_NODES.length) return
    const timer = setInterval(() => {
      setActiveNode((prev) => {
        const idx = ALL_NODES.findIndex((n) => n.id === prev)
        return ALL_NODES[(idx + 1) % ALL_NODES.length].id
      })
    }, 2000)
    return () => clearInterval(timer)
  }, [discoveredCount])

  return (
    <div
      ref={containerRef}
      className="relative w-[480px] h-[480px] mx-auto"
      role="img"
      aria-label="推しネットワーク: 推しを中心に関連人物・組織・情報源が自動発見される図"
    >
      {/* Orbit rings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 480">
        {/* Ring outlines */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING1_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="4 6"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease 0.3s',
          }}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING2_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
          strokeDasharray="4 8"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease 0.6s',
          }}
        />

        {/* Connection lines */}
        {ALL_NODES.map((node, i) => {
          if (i >= discoveredCount) return null
          const pos = getNodePos(node)
          const isActive = activeNode === node.id
          return (
            <line
              key={`line-${node.id}`}
              x1={CENTER}
              y1={CENTER}
              x2={pos.x}
              y2={pos.y}
              stroke={isActive ? node.color : 'rgba(255,255,255,0.04)'}
              strokeWidth={isActive ? 1.5 : 0.5}
              style={{ transition: 'all 0.4s ease' }}
            />
          )
        })}

        {/* Cross-connections (ring1 neighbors) */}
        {RING1_NODES.map((node, i) => {
          const next = RING1_NODES[(i + 1) % RING1_NODES.length]
          const nodeIdx = ALL_NODES.findIndex((n) => n.id === node.id)
          const nextIdx = ALL_NODES.findIndex((n) => n.id === next.id)
          if (nodeIdx >= discoveredCount || nextIdx >= discoveredCount) return null
          const p1 = getNodePos(node)
          const p2 = getNodePos(next)
          return (
            <line
              key={`cross-${node.id}-${next.id}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Data flow particles (animated dots along connections) */}
        {ALL_NODES.slice(0, discoveredCount).map((node, i) => {
          const pos = getNodePos(node)
          return (
            <circle key={`particle-${node.id}`} r="1.5" fill={node.color} opacity="0.6">
              <animateMotion
                dur={`${2 + (i % 3)}s`}
                repeatCount="indefinite"
                path={`M${pos.x},${pos.y} L${CENTER},${CENTER}`}
              />
            </circle>
          )
        })}
      </svg>

      {/* Center: 推し */}
      <div
        className="absolute z-20"
        style={{
          left: CENTER,
          top: CENTER,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
        }}
      >
        <div className="relative">
          <div
            className="absolute -inset-3 rounded-full"
            style={{
              background: 'rgba(255, 45, 120, 0.12)',
              animation: isVisible ? 'pulse-ring 3s ease-out infinite' : 'none',
            }}
          />
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(139,92,246,0.25))',
              border: '1.5px solid rgba(255,45,120,0.4)',
              boxShadow: '0 0 40px rgba(255,45,120,0.25)',
            }}
          >
            <span className="text-base font-bold text-white">推し</span>
          </div>
        </div>
      </div>

      {/* Ring labels */}
      <div
        className="absolute text-[8px] text-white/15 tracking-widest uppercase"
        style={{
          left: CENTER + RING1_RADIUS + 8,
          top: CENTER - 6,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease 1s',
        }}
      >
        関係者
      </div>
      <div
        className="absolute text-[8px] text-white/10 tracking-widest uppercase"
        style={{
          left: CENTER + RING2_RADIUS + 8,
          top: CENTER - 6,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease 1.5s',
        }}
      >
        周辺
      </div>

      {/* Network nodes */}
      {ALL_NODES.map((node, i) => {
        const pos = getNodePos(node)
        const isDiscovered = i < discoveredCount
        const isActive = activeNode === node.id
        const isPulsing = pulseNode === node.id
        const size = node.ring === 1 ? 40 : 32

        return (
          <div
            key={node.id}
            className="absolute z-10 flex flex-col items-center cursor-pointer"
            style={{
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              opacity: isDiscovered ? 1 : 0,
              transition: `opacity 0.4s ease, transform 0.3s ease`,
            }}
            onMouseEnter={() => setActiveNode(node.id)}
          >
            <div className="relative">
              {/* Discovery pulse */}
              {isPulsing && (
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: -4,
                    background: `${node.color}30`,
                    animation: 'pulse-ring 0.8s ease-out',
                  }}
                />
              )}
              {/* Active glow */}
              {isActive && (
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: -3,
                    background: `${node.color}20`,
                    animation: 'pulse-ring 2s ease-out infinite',
                  }}
                />
              )}
              <div
                className="rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  width: size,
                  height: size,
                  background: isActive ? `${node.color}30` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? `${node.color}60` : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isActive ? `0 0 16px ${node.color}30` : 'none',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <NodeIcon type={node.type} color={isActive ? node.color : '#555'} size={node.ring === 1 ? 16 : 13} />
              </div>
            </div>
            <div
              className="mt-1 text-center transition-colors duration-300 whitespace-nowrap"
              style={{
                color: isActive ? node.color : 'rgba(255,255,255,0.25)',
              }}
            >
              <div className="text-[9px] font-medium">{node.name}</div>
            </div>
          </div>
        )
      })}

      {/* Discovery counter */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.5s',
        }}
      >
        <div className="text-[10px] text-white/20">
          {discoveredCount < ALL_NODES.length ? (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" style={{ animation: 'pulse-glow 1s ease-in-out infinite' }} />
              ネットワーク探索中... {discoveredCount}/{ALL_NODES.length} ノード発見
            </>
          ) : (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
              {ALL_NODES.length} ノードの監視ネットワークを構築完了
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NodeIcon({ type, color, size }: { type: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    member: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    org: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    staff: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    fan: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    venue: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    collab: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    media: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[type] || icons.member} />
    </svg>
  )
}

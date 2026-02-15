'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { TYPE_CONFIG } from '@/lib/constants/network-types'

export interface NetworkNodeData {
  id: string
  name: string
  node_type: string
  ring: number
  relationship: string
  is_active: boolean
}

interface NetworkGraphProps {
  nodes: NetworkNodeData[]
  oshiName: string
}

const RING1_RADIUS = 110
const RING2_RADIUS = 190
const CENTER = 220
const VIEWBOX = 440

function getNodePosition(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

export function NetworkGraph({ nodes, oshiName }: NetworkGraphProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  const { ring1, ring2 } = useMemo(() => {
    const r1 = nodes.filter((n) => n.ring === 1)
    const r2 = nodes.filter((n) => n.ring === 2)
    return { ring1: r1, ring2: r2 }
  }, [nodes])

  const allWithPos = useMemo(() => {
    const items: Array<NetworkNodeData & { x: number; y: number }> = []
    ring1.forEach((node, i) => {
      const pos = getNodePosition(i, ring1.length, RING1_RADIUS)
      items.push({ ...node, ...pos })
    })
    ring2.forEach((node, i) => {
      const pos = getNodePosition(i, ring2.length, RING2_RADIUS)
      items.push({ ...node, ...pos })
    })
    return items
  }, [ring1, ring2])

  if (nodes.length === 0) return null

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="w-full h-full">
        {/* Orbit rings */}
        {ring1.length > 0 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RING1_RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/10"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        )}
        {ring2.length > 0 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RING2_RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/8"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        )}

        {/* Connection lines */}
        {allWithPos.map((node) => {
          const isActive = activeNode === node.id
          const config = TYPE_CONFIG[node.node_type] || TYPE_CONFIG.fan
          return (
            <line
              key={`line-${node.id}`}
              x1={CENTER}
              y1={CENTER}
              x2={node.x}
              y2={node.y}
              stroke={isActive ? config.color : 'currentColor'}
              className={isActive ? '' : 'text-muted-foreground/8'}
              strokeWidth={isActive ? 1.5 : 0.5}
              style={{ transition: 'all 0.3s ease' }}
            />
          )
        })}

        {/* Data flow particles */}
        {allWithPos.map((node, i) => {
          const config = TYPE_CONFIG[node.node_type] || TYPE_CONFIG.fan
          return (
            <circle
              key={`particle-${node.id}`}
              r="1.5"
              fill={config.color}
              opacity="0.5"
            >
              <animateMotion
                dur={`${2.5 + (i % 3)}s`}
                repeatCount="indefinite"
                path={`M${node.x},${node.y} L${CENTER},${CENTER}`}
              />
            </circle>
          )
        })}

        {/* Center node */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={32}
          fill="url(#center-gradient)"
          stroke="rgba(255,45,120,0.4)"
          strokeWidth="1.5"
        />
        <text
          x={CENTER}
          y={CENTER + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="11"
          fontWeight="bold"
        >
          {oshiName.length > 5 ? `${oshiName.slice(0, 5)}...` : oshiName}
        </text>

        {/* Outer nodes */}
        {allWithPos.map((node) => {
          const config = TYPE_CONFIG[node.node_type] || TYPE_CONFIG.fan
          const isActive = activeNode === node.id
          const size = node.ring === 1 ? 20 : 16

          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={size + 4}
                  fill={`${config.color}20`}
                  stroke={`${config.color}40`}
                  strokeWidth="0.5"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={size}
                fill={isActive ? `${config.color}30` : 'currentColor'}
                className={isActive ? '' : 'text-muted/30'}
                stroke={isActive ? config.color : 'currentColor'}
                strokeWidth={isActive ? 1.5 : 0.5}
                style={{ transition: 'all 0.3s ease' }}
              />
              <text
                x={node.x}
                y={node.y + size + 12}
                textAnchor="middle"
                fill={isActive ? config.color : 'currentColor'}
                className={isActive ? '' : 'text-muted-foreground/50'}
                fontSize="8"
                fontWeight={isActive ? 'bold' : 'normal'}
                style={{ transition: 'all 0.3s ease' }}
              >
                {node.name.length > 8 ? `${node.name.slice(0, 8)}..` : node.name}
              </text>

              {/* Node type icon */}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isActive ? config.color : 'currentColor'}
                className={isActive ? '' : 'text-muted-foreground/30'}
                fontSize={node.ring === 1 ? '9' : '7'}
                style={{ transition: 'all 0.3s ease' }}
              >
                {config.label.charAt(0)}
              </text>
            </g>
          )
        })}

        {/* Gradient defs */}
        <defs>
          <radialGradient id="center-gradient">
            <stop offset="0%" stopColor="rgba(255,45,120,0.35)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.25)" />
          </radialGradient>
        </defs>
      </svg>

      {/* Active node tooltip */}
      {activeNode && (() => {
        const node = allWithPos.find((n) => n.id === activeNode)
        if (!node) return null
        const config = TYPE_CONFIG[node.node_type] || TYPE_CONFIG.fan
        return (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border rounded-lg px-3 py-2 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-medium">{node.name}</span>
              <span className="text-muted-foreground">({config.label})</span>
            </div>
            <p className="text-muted-foreground mt-0.5">{node.relationship}</p>
          </div>
        )
      })()}
    </div>
  )
}

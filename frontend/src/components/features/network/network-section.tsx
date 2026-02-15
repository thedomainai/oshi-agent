'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NetworkGraph, type NetworkNodeData } from './network-graph'
import { Loader2, Network, RefreshCw, Zap } from 'lucide-react'
import { TYPE_LABELS } from '@/lib/constants/network-types'

interface NetworkSectionProps {
  oshiId: string
  oshiName: string
}

export function NetworkSection({ oshiId, oshiName }: NetworkSectionProps) {
  const [nodes, setNodes] = useState<NetworkNodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNetwork = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/network/${oshiId}`)
      if (!res.ok) throw new Error('ネットワークの取得に失敗しました')
      const json = await res.json()
      setNodes(json.data?.nodes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '取得エラー')
    } finally {
      setLoading(false)
    }
  }, [oshiId])

  useEffect(() => {
    fetchNetwork()
  }, [fetchNetwork])

  const handleDiscover = useCallback(async () => {
    try {
      setDiscovering(true)
      setError(null)
      const res = await fetch('/api/network/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oshiId }),
      })
      if (!res.ok) throw new Error('ネットワーク発見に失敗しました')
      await fetchNetwork()
    } catch (err) {
      setError(err instanceof Error ? err.message : '発見エラー')
    } finally {
      setDiscovering(false)
    }
  }, [oshiId, fetchNetwork])

  const { ring1Count, ring2Count } = useMemo(() => ({
    ring1Count: nodes.filter((n) => n.ring === 1).length,
    ring2Count: nodes.filter((n) => n.ring === 2).length,
  }), [nodes])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">ネットワーク読み込み中...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5 text-cyan-500" />
            推しネットワーク
          </CardTitle>
          <div className="flex gap-2">
            {nodes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNetwork}
                disabled={loading}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                更新
              </Button>
            )}
            <Button
              variant={nodes.length === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={handleDiscover}
              disabled={discovering}
            >
              {discovering ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  探索中...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  {nodes.length === 0 ? 'ネットワークを発見' : '再探索'}
                </>
              )}
            </Button>
          </div>
        </div>
        {nodes.length > 0 && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              {nodes.length}ノード監視中
            </span>
            <Badge variant="outline" className="text-xs">
              関係者 {ring1Count}
            </Badge>
            <Badge variant="outline" className="text-xs">
              周辺 {ring2Count}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {nodes.length === 0 ? (
          <div className="text-center py-8">
            <Network className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              まだネットワークが構築されていません
            </p>
            <p className="text-xs text-muted-foreground">
              「ネットワークを発見」をクリックすると、AIが{oshiName}に関連する人物・組織・情報源を自動で特定します。
            </p>
          </div>
        ) : (
          <>
            <NetworkGraph nodes={nodes} oshiName={oshiName} />

            {/* Node list */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50 text-xs"
                >
                  <span className="text-muted-foreground">
                    {TYPE_LABELS[node.node_type] || node.node_type}
                  </span>
                  <span className="font-medium truncate">{node.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

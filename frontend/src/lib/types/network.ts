/**
 * ネットワーク関連の型定義
 */

export interface NetworkNode {
  id: string
  name: string
  node_type: string
  ring: number
  relationship: string
  is_active: boolean
}

export interface NetworkDiscoverNode {
  id: string
  name: string
  node_type: string
  ring: number
  relationship: string
}

export interface NetworkDiscoverResponse {
  oshi_id: string
  oshi_name: string
  discovered_count: number
  nodes: NetworkDiscoverNode[]
}

export interface NetworkListResponse {
  oshi_id: string
  nodes: NetworkNode[]
}

export interface NetworkScoutResponse {
  oshi_id: string
  oshi_name: string
  direct_count: number
  network_count: number
  total_count: number
  new_info_ids: string[]
  priority_results: Record<string, string>
}

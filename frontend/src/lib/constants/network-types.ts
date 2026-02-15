/**
 * ネットワークノードタイプの設定
 */

export const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  member: { label: 'メンバー', color: '#3b82f6' },
  staff: { label: 'スタッフ', color: '#06b6d4' },
  org: { label: '組織', color: '#f59e0b' },
  fan: { label: 'ファン情報', color: '#10b981' },
  venue: { label: '会場', color: '#8b5cf6' },
  collab: { label: 'コラボ', color: '#f97316' },
  media: { label: 'メディア', color: '#14b8a6' },
}

export const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_CONFIG).map(([key, value]) => [key, value.label])
)

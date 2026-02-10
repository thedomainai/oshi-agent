import { TimelineItem } from './timeline-item'
import type { CollectedInfo, Oshi } from '@/types/api'

interface TimelineListProps {
  infos: CollectedInfo[]
  oshis: Oshi[]
}

export function TimelineList({ infos, oshis }: TimelineListProps) {
  const oshiMap = new Map(oshis.map((oshi) => [oshi.id, oshi.name]))

  return (
    <div className="space-y-4">
      {infos.map((info) => (
        <TimelineItem key={info.id} info={info} oshiName={oshiMap.get(info.oshiId)} />
      ))}
    </div>
  )
}

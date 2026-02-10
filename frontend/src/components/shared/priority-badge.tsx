import { Badge } from '@/components/ui/badge'
import type { Priority } from '@/types/api'
import { cn } from '@/lib/utils/cn'

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: '緊急',
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100',
  },
  important: {
    label: '注目',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100',
  },
  normal: {
    label: '日常',
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100',
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Oshi, Priority } from '@/types/api'

interface TimelineFilterProps {
  oshis: Oshi[]
}

export function TimelineFilter({ oshis }: TimelineFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [oshiId, setOshiId] = useState(searchParams.get('oshiId') || 'all')
  const [priority, setPriority] = useState<string>(searchParams.get('priority') || 'all')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/timeline?${params.toString()}`)
  }

  const handleOshiChange = (value: string) => {
    setOshiId(value)
    updateFilter('oshiId', value)
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    updateFilter('priority', value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Select value={oshiId} onValueChange={handleOshiChange}>
          <SelectTrigger>
            <SelectValue placeholder="推しで絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての推し</SelectItem>
            {oshis.map((oshi) => (
              <SelectItem key={oshi.id} value={oshi.id}>
                {oshi.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder="優先度で絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての優先度</SelectItem>
            <SelectItem value="urgent">緊急</SelectItem>
            <SelectItem value="important">注目</SelectItem>
            <SelectItem value="normal">日常</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

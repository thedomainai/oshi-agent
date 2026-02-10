'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface TripPlanGenerateButtonProps {
  eventId: string
}

export function TripPlanGenerateButton({ eventId }: TripPlanGenerateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trip-plans/${eventId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('遠征プランの生成に失敗しました')
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : '遠征プランの生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isLoading}>
      <Sparkles className="h-4 w-4 mr-2" />
      {isLoading ? '生成中...' : 'AIで遠征プランを生成'}
    </Button>
  )
}

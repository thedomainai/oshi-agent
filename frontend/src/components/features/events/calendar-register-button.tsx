'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface CalendarRegisterButtonProps {
  eventId: string
  isRegistered: boolean
}

export function CalendarRegisterButton({ eventId, isRegistered }: CalendarRegisterButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/calendar`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('カレンダー登録に失敗しました')
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'カレンダー登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <Button variant="outline" disabled>
        <Calendar className="h-4 w-4 mr-2" />
        登録済み
      </Button>
    )
  }

  return (
    <Button onClick={handleRegister} disabled={isLoading}>
      <Calendar className="h-4 w-4 mr-2" />
      {isLoading ? '登録中...' : 'カレンダーに登録'}
    </Button>
  )
}

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/shared/error-message'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">エラーが発生しました</h1>
      <ErrorMessage message={error.message} />
      <Button onClick={reset}>再試行</Button>
    </div>
  )
}

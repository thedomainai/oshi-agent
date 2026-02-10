import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function TimelineLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}

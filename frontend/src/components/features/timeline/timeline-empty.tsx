import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import Link from 'next/link'

export function TimelineEmpty() {
  return (
    <EmptyState
      icon={Info}
      title="情報がまだありません"
      description="推しを登録すると、AIが自動で情報を収集してここに表示されます。"
      action={
        <Button asChild>
          <Link href="/oshi/new">推しを登録する</Link>
        </Button>
      }
    />
  )
}

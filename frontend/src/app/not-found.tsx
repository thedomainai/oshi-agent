import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold mb-2">404</CardTitle>
          <CardDescription className="text-lg">ページが見つかりません</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Button asChild>
            <Link href="/timeline">
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

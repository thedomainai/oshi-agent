import { signIn } from '@/lib/auth/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">オシエージェント</CardTitle>
        <CardDescription className="text-base">AI推し活マネージャー</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          推しの情報を自動収集し、スケジュール管理や遠征プラン作成をサポートします
        </p>
        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/timeline' })
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            Googleでログイン
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

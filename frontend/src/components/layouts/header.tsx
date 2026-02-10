import { auth, signOut } from '@/lib/auth/auth'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">オシエージェント</h1>
          <span className="text-xs text-muted-foreground">AI推し活マネージャー</span>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || ''} className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-8 w-8 rounded-full bg-muted p-1" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{session.user.name || session.user.email}</span>
              </div>

              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

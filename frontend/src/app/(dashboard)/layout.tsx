import { Header } from '@/components/layouts/header'
import { Sidebar } from '@/components/layouts/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:ml-0">
          <div className="container max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

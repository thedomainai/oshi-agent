import { OshiForm } from '@/components/features/oshi/oshi-form'

export default async function NewOshiPage() {
  const handleSubmit = async (data: {
    name: string
    category: string
    keywords: string[]
    sources: string[]
  }) => {
    'use server'

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/oshi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('推しの登録に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">推しを登録</h1>
        <p className="text-muted-foreground">推しに関する情報を入力して、AIによる情報収集を開始します</p>
      </div>

      <OshiForm onSubmit={handleSubmit} submitLabel="登録" />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface OshiFormProps {
  initialData?: {
    name: string
    category: string
    keywords: string[]
    sources: string[]
  }
  onSubmit: (data: { name: string; category: string; keywords: string[]; sources: string[] }) => Promise<void>
  submitLabel?: string
}

export function OshiForm({ initialData, onSubmit, submitLabel = '登録' }: OshiFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || [])
  const [keywordInput, setKeywordInput] = useState('')
  const [sources, setSources] = useState<string[]>(initialData?.sources || [])
  const [sourceInput, setSourceInput] = useState('')
  const [error, setError] = useState('')

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const addSource = () => {
    const trimmed = sourceInput.trim()
    if (trimmed && !sources.includes(trimmed)) {
      setSources([...sources, trimmed])
      setSourceInput('')
    }
  }

  const removeSource = (source: string) => {
    setSources(sources.filter((s) => s !== source))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !category || keywords.length === 0 || sources.length === 0) {
      setError('すべての項目を入力してください')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({ name, category, keywords, sources })
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>推し情報</CardTitle>
        <CardDescription>推しに関する情報を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              名前 <span className="text-destructive">*</span>
            </label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="推しの名前" />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              カテゴリ <span className="text-destructive">*</span>
            </label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例: アイドル、声優、VTuber"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm font-medium">
              キーワード <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="キーワードを入力してEnter"
              />
              <Button type="button" onClick={addKeyword}>
                追加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                  <button type="button" onClick={() => removeKeyword(keyword)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sources" className="text-sm font-medium">
              情報源 <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="sources"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSource())}
                placeholder="例: Twitter, 公式サイト"
              />
              <Button type="button" onClick={addSource}>
                追加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sources.map((source) => (
                <Badge key={source} variant="outline">
                  {source}
                  <button type="button" onClick={() => removeSource(source)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '処理中...' : submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

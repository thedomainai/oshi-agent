import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Oshi } from '@/types/api'

interface OshiCardProps {
  oshi: Oshi
}

export function OshiCard({ oshi }: OshiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{oshi.name}</CardTitle>
        <CardDescription>{oshi.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">キーワード</p>
            <div className="flex flex-wrap gap-2">
              {oshi.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">情報源</p>
            <div className="flex flex-wrap gap-2">
              {oshi.sources.map((source) => (
                <Badge key={source} variant="outline">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

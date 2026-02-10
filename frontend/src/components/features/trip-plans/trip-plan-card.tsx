import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TripPlan } from '@/types/api'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { Calendar, MapPin, Train, Hotel, DollarSign } from 'lucide-react'

interface TripPlanCardProps {
  tripPlan: TripPlan
}

export function TripPlanCard({ tripPlan }: TripPlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tripPlan.destination}</CardTitle>
        <CardDescription>
          {formatDate(tripPlan.departureDate)} 〜 {formatDate(tripPlan.returnDate)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Train className="h-4 w-4" />
              交通手段
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              {tripPlan.transportationSuggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Hotel className="h-4 w-4" />
              宿泊施設
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              {tripPlan.accommodationSuggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <DollarSign className="h-4 w-4" />
              予算目安
            </div>
            <p className="text-lg font-semibold ml-6">{formatCurrency(tripPlan.estimatedBudget)}</p>
          </div>

          {tripPlan.notes && (
            <div>
              <p className="text-sm font-medium mb-2">メモ</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tripPlan.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

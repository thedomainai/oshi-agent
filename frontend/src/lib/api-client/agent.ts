import { apiRequest } from './client'

interface TriggerAgentResponse {
  message: string
  taskId?: string
}

interface GenerateTripPlanRequest {
  eventId: string
  destination: string
  startDate: string
  endDate: string
}

interface GenerateTripPlanResponse {
  tripPlan: {
    destination: string
    departureDate: string
    returnDate: string
    transportationSuggestions: string[]
    accommodationSuggestions: string[]
    estimatedBudget: number
    notes?: string
  }
}

interface GenerateBudgetReportRequest {
  month: string
}

interface GenerateBudgetReportResponse {
  report: {
    totalAmount: number
    byCategory: Record<string, number>
    byOshi: Record<string, { name: string; amount: number }>
    insights: string[]
  }
}

export async function triggerScoutAgent(userId: string, oshiId: string): Promise<TriggerAgentResponse> {
  return apiRequest<TriggerAgentResponse>('/api/agents/scout', {
    method: 'POST',
    userId,
    body: JSON.stringify({ oshiId }),
  })
}

export async function triggerPriorityAgent(userId: string): Promise<TriggerAgentResponse> {
  return apiRequest<TriggerAgentResponse>('/api/agents/priority', {
    method: 'POST',
    userId,
  })
}

export async function triggerCalendarAgent(userId: string, eventId: string): Promise<TriggerAgentResponse> {
  return apiRequest<TriggerAgentResponse>('/api/agents/calendar', {
    method: 'POST',
    userId,
    body: JSON.stringify({ eventId }),
  })
}

export async function generateTripPlan(userId: string, data: GenerateTripPlanRequest): Promise<GenerateTripPlanResponse> {
  return apiRequest<GenerateTripPlanResponse>('/api/agents/trip-plan', {
    method: 'POST',
    userId,
    body: JSON.stringify(data),
  })
}

export async function generateBudgetReport(userId: string, data: GenerateBudgetReportRequest): Promise<GenerateBudgetReportResponse> {
  return apiRequest<GenerateBudgetReportResponse>('/api/agents/budget-report', {
    method: 'POST',
    userId,
    body: JSON.stringify(data),
  })
}

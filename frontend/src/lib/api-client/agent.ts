import { apiRequest } from './client'
import type {
  NetworkNode,
  NetworkDiscoverResponse,
  NetworkListResponse,
  NetworkScoutResponse,
} from '@/lib/types/network'

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

interface SummaryResponse {
  oshi_id: string
  oshi_name: string
  collected_count: number
  summary: string
}

export async function triggerSummaryAgent(userId: string, oshiId: string): Promise<SummaryResponse> {
  return apiRequest<SummaryResponse>('/agent/summary', {
    method: 'POST',
    userId,
    body: JSON.stringify({ oshi_id: oshiId }),
  })
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

// ネットワーク関連
// 型定義は @/lib/types/network から import

export { NetworkNode }

export async function discoverNetwork(userId: string, oshiId: string): Promise<NetworkDiscoverResponse> {
  return apiRequest<NetworkDiscoverResponse>('/agent/network/discover', {
    method: 'POST',
    userId,
    body: JSON.stringify({ oshi_id: oshiId }),
  })
}

export async function getNetwork(userId: string, oshiId: string): Promise<NetworkListResponse> {
  return apiRequest<NetworkListResponse>(`/agent/network/${oshiId}`, {
    method: 'GET',
    userId,
  })
}

export async function runNetworkScout(userId: string, oshiId: string): Promise<NetworkScoutResponse> {
  return apiRequest<NetworkScoutResponse>('/agent/network/scout', {
    method: 'POST',
    userId,
    body: JSON.stringify({ oshi_id: oshiId }),
  })
}

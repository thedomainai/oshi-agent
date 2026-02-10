export interface ApiResponse<T> {
  data: T
  error?: never
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  data?: never
}

export type Priority = 'urgent' | 'important' | 'normal'
export type Category = 'ticket' | 'goods' | 'trip' | 'other'

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  createdAt: string
  updatedAt: string
}

export interface Oshi {
  id: string
  userId: string
  name: string
  category: string
  keywords: string[]
  sources: string[]
  createdAt: string
  updatedAt: string
}

export interface CollectedInfo {
  id: string
  userId: string
  oshiId: string
  title: string
  content: string
  source: string
  url?: string
  priority: Priority
  collectedAt: string
  createdAt: string
}

export interface Event {
  id: string
  userId: string
  oshiId: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  url?: string
  isRegistered: boolean
  createdAt: string
  updatedAt: string
}

export interface TripPlan {
  id: string
  userId: string
  eventId: string
  destination: string
  departureDate: string
  returnDate: string
  transportationSuggestions: string[]
  accommodationSuggestions: string[]
  estimatedBudget: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  userId: string
  oshiId?: string
  eventId?: string
  category: Category
  amount: number
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseReport {
  month: string
  totalAmount: number
  byCategory: Record<Category, number>
  byOshi: Record<string, { name: string; amount: number }>
  expenses: Expense[]
}

export interface Settings {
  userId: string
  notificationEnabled: boolean
  emailNotification: boolean
  priorityThreshold: Priority
  budgetLimit?: number
  budgetAlertThreshold?: number
  calendarSync: boolean
  createdAt: string
  updatedAt: string
}

import { ExternalApiError } from '../errors'

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''

interface RequestOptions extends RequestInit {
  userId?: string
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { userId, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Internal-Api-Key': INTERNAL_API_KEY,
  }

  if (userId) {
    headers['X-User-Id'] = userId
  }

  const url = `${PYTHON_BACKEND_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new ExternalApiError(
        errorData.error || errorData.message || 'API request failed',
        response.status
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error
    }

    if (error instanceof Error) {
      throw new ExternalApiError(`Python Backend との通信に失敗しました: ${error.message}`, 500)
    }

    throw new ExternalApiError('Python Backend との通信に失敗しました', 500)
  }
}

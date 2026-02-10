import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { getSettings, updateSettings } from '@/lib/firestore/settings'
import { handleError } from '@/lib/errors'
import { settingsSchema } from '@/lib/utils/validation'

export async function GET() {
  try {
    const userId = await getUserId()
    const settings = await getSettings(userId)

    return Response.json({ data: settings })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId()
    const body = await request.json()

    const validated = settingsSchema.parse(body)
    const settings = await updateSettings(userId, validated)

    return Response.json({ data: settings })
  } catch (error) {
    return handleError(error)
  }
}

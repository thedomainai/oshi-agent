import { NextRequest } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import { updateOshi, deleteOshi } from '@/lib/firestore/oshis'
import { handleError } from '@/lib/errors'
import { oshiSchema } from '@/lib/utils/validation'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getUserId()
    const body = await request.json()

    const validated = oshiSchema.parse(body)
    const oshi = await updateOshi(id, userId, validated)

    return Response.json({ data: oshi })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getUserId()
    await deleteOshi(id, userId)

    return Response.json({ data: { success: true } })
  } catch (error) {
    return handleError(error)
  }
}

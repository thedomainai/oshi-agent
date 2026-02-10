import { getFirestore } from './client'
import type { Event } from '@/types/api'
import { NotFoundError } from '../errors'

const COLLECTION = 'events'

interface GetEventsOptions {
  oshiId?: string
  from?: string
  to?: string
  limit?: number
}

export async function getEvents(userId: string, options: GetEventsOptions = {}): Promise<Event[]> {
  const db = getFirestore()
  const { oshiId, from, to, limit = 100 } = options

  let query = db.collection(COLLECTION).where('userId', '==', userId)

  if (oshiId) {
    query = query.where('oshiId', '==', oshiId)
  }

  if (from) {
    query = query.where('startDate', '>=', from)
  }

  if (to) {
    query = query.where('startDate', '<=', to)
  }

  query = query.orderBy('startDate', 'asc')

  if (limit > 0) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[]
}

export async function getEvent(eventId: string, userId: string): Promise<Event> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(eventId).get()

  if (!doc.exists) {
    throw new NotFoundError('イベントが見つかりません')
  }

  const data = doc.data()
  if (data?.userId !== userId) {
    throw new NotFoundError('イベントが見つかりません')
  }

  return {
    id: doc.id,
    ...data,
  } as Event
}

export async function updateEventRegistration(eventId: string, userId: string, isRegistered: boolean): Promise<Event> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(eventId).get()

  if (!doc.exists) {
    throw new NotFoundError('イベントが見つかりません')
  }

  const data = doc.data()
  if (data?.userId !== userId) {
    throw new NotFoundError('イベントが見つかりません')
  }

  await db.collection(COLLECTION).doc(eventId).update({
    isRegistered,
    updatedAt: new Date().toISOString(),
  })

  const updated = await db.collection(COLLECTION).doc(eventId).get()

  return {
    id: updated.id,
    ...updated.data(),
  } as Event
}

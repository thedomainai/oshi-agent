import { getFirestore } from './client'
import type { TripPlan } from '@/types/api'
import { NotFoundError } from '../errors'

const COLLECTION = 'trip_plans'

export async function getTripPlan(eventId: string, userId: string): Promise<TripPlan | null> {
  const db = getFirestore()
  const snapshot = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('eventId', '==', eventId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as TripPlan
}

export async function createTripPlan(userId: string, data: Omit<TripPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TripPlan> {
  const db = getFirestore()
  const now = new Date().toISOString()

  const tripPlanData = {
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = await db.collection(COLLECTION).add(tripPlanData)

  return {
    id: docRef.id,
    ...tripPlanData,
  }
}

export async function updateTripPlan(tripPlanId: string, userId: string, data: Partial<Omit<TripPlan, 'id' | 'userId' | 'eventId' | 'createdAt' | 'updatedAt'>>): Promise<TripPlan> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(tripPlanId).get()

  if (!doc.exists) {
    throw new NotFoundError('遠征プランが見つかりません')
  }

  const existingData = doc.data()
  if (existingData?.userId !== userId) {
    throw new NotFoundError('遠征プランが見つかりません')
  }

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await db.collection(COLLECTION).doc(tripPlanId).update(updateData)

  const updated = await db.collection(COLLECTION).doc(tripPlanId).get()

  return {
    id: updated.id,
    ...updated.data(),
  } as TripPlan
}

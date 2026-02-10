import { getFirestore } from './client'
import type { Oshi } from '@/types/api'
import { NotFoundError } from '../errors'

const COLLECTION = 'oshis'

export async function getOshis(userId: string): Promise<Oshi[]> {
  const db = getFirestore()
  const snapshot = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Oshi[]
}

export async function getOshi(oshiId: string, userId: string): Promise<Oshi> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(oshiId).get()

  if (!doc.exists) {
    throw new NotFoundError('推しが見つかりません')
  }

  const data = doc.data()
  if (data?.userId !== userId) {
    throw new NotFoundError('推しが見つかりません')
  }

  return {
    id: doc.id,
    ...data,
  } as Oshi
}

export async function createOshi(userId: string, data: Omit<Oshi, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Oshi> {
  const db = getFirestore()
  const now = new Date().toISOString()

  const oshiData = {
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = await db.collection(COLLECTION).add(oshiData)

  return {
    id: docRef.id,
    ...oshiData,
  }
}

export async function updateOshi(oshiId: string, userId: string, data: Partial<Omit<Oshi, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Oshi> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(oshiId).get()

  if (!doc.exists) {
    throw new NotFoundError('推しが見つかりません')
  }

  const existingData = doc.data()
  if (existingData?.userId !== userId) {
    throw new NotFoundError('推しが見つかりません')
  }

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await db.collection(COLLECTION).doc(oshiId).update(updateData)

  const updated = await db.collection(COLLECTION).doc(oshiId).get()

  return {
    id: updated.id,
    ...updated.data(),
  } as Oshi
}

export async function deleteOshi(oshiId: string, userId: string): Promise<void> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(oshiId).get()

  if (!doc.exists) {
    throw new NotFoundError('推しが見つかりません')
  }

  const data = doc.data()
  if (data?.userId !== userId) {
    throw new NotFoundError('推しが見つかりません')
  }

  await db.collection(COLLECTION).doc(oshiId).delete()
}

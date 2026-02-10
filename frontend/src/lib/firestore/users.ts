import { getFirestore } from './client'
import type { User } from '@/types/api'
import { NotFoundError } from '../errors'

const COLLECTION = 'users'

export async function getUser(userId: string): Promise<User | null> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(userId).get()

  if (!doc.exists) {
    return null
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as User
}

export async function createUser(userId: string, data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const db = getFirestore()
  const now = new Date().toISOString()

  const userData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(COLLECTION).doc(userId).set(userData)

  return {
    id: userId,
    ...userData,
  }
}

export async function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(userId).get()

  if (!doc.exists) {
    throw new NotFoundError('ユーザーが見つかりません')
  }

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await db.collection(COLLECTION).doc(userId).update(updateData)

  const updated = await db.collection(COLLECTION).doc(userId).get()

  return {
    id: updated.id,
    ...updated.data(),
  } as User
}

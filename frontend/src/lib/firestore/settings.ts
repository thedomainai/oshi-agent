import { getFirestore } from './client'
import type { Settings } from '@/types/api'

const COLLECTION = 'settings'

export async function getSettings(userId: string): Promise<Settings | null> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(userId).get()

  if (!doc.exists) {
    return null
  }

  return {
    userId: doc.id,
    ...doc.data(),
  } as Settings
}

export async function updateSettings(userId: string, data: Partial<Omit<Settings, 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Settings> {
  const db = getFirestore()
  const doc = await db.collection(COLLECTION).doc(userId).get()

  if (!doc.exists) {
    const now = new Date().toISOString()
    const newSettings = {
      notificationEnabled: true,
      emailNotification: false,
      priorityThreshold: 'important' as const,
      calendarSync: false,
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection(COLLECTION).doc(userId).set(newSettings)

    return {
      userId,
      ...newSettings,
    }
  }

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await db.collection(COLLECTION).doc(userId).update(updateData)

  const updated = await db.collection(COLLECTION).doc(userId).get()

  return {
    userId: updated.id,
    ...updated.data(),
  } as Settings
}

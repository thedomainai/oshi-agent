import { getFirestore } from './client'
import type { CollectedInfo, Priority } from '@/types/api'

const COLLECTION = 'collected_infos'

interface GetInfosOptions {
  oshiId?: string
  priority?: Priority
  limit?: number
  offset?: number
}

export async function getInfos(userId: string, options: GetInfosOptions = {}): Promise<CollectedInfo[]> {
  const db = getFirestore()
  const { oshiId, priority, limit = 50, offset = 0 } = options

  let query = db.collection(COLLECTION).where('userId', '==', userId)

  if (oshiId) {
    query = query.where('oshiId', '==', oshiId)
  }

  if (priority) {
    query = query.where('priority', '==', priority)
  }

  query = query.orderBy('collectedAt', 'desc')

  if (offset > 0) {
    query = query.offset(offset)
  }

  if (limit > 0) {
    query = query.limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectedInfo[]
}

export async function getAlertInfos(userId: string): Promise<{ urgent: CollectedInfo[]; important: CollectedInfo[] }> {
  const db = getFirestore()

  const [urgentSnapshot, importantSnapshot] = await Promise.all([
    db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('priority', '==', 'urgent')
      .orderBy('collectedAt', 'desc')
      .limit(10)
      .get(),
    db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('priority', '==', 'important')
      .orderBy('collectedAt', 'desc')
      .limit(10)
      .get(),
  ])

  return {
    urgent: urgentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CollectedInfo[],
    important: importantSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CollectedInfo[],
  }
}

export async function getInfoCount(userId: string): Promise<{ total: number; urgent: number; important: number }> {
  const db = getFirestore()

  const [totalSnapshot, urgentSnapshot, importantSnapshot] = await Promise.all([
    db.collection(COLLECTION)
      .where('userId', '==', userId)
      .count()
      .get(),
    db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('priority', '==', 'urgent')
      .count()
      .get(),
    db.collection(COLLECTION)
      .where('userId', '==', userId)
      .where('priority', '==', 'important')
      .count()
      .get(),
  ])

  return {
    total: totalSnapshot.data().count,
    urgent: urgentSnapshot.data().count,
    important: importantSnapshot.data().count,
  }
}

export async function getInfosByOshiIds(userId: string, oshiIds: string[], limit: number = 50): Promise<CollectedInfo[]> {
  if (oshiIds.length === 0) {
    return []
  }

  const db = getFirestore()
  const snapshot = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('oshiId', 'in', oshiIds)
    .orderBy('collectedAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CollectedInfo[]
}

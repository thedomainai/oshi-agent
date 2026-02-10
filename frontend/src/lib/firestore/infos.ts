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

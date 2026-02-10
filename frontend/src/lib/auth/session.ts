import { auth } from './auth'
import { UnauthorizedError } from '../errors'

export async function getSession() {
  const session = await auth()
  return session
}

export async function requireSession() {
  const session = await auth()
  if (!session || !session.user) {
    throw new UnauthorizedError('ログインが必要です')
  }
  return session
}

export async function getUserId(): Promise<string> {
  const session = await requireSession()
  return session.user.id
}

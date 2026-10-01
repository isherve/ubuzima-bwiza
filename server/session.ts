import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { ensureDatabase, findUserById, toPublicUser, type DbUser } from './db.js'

function secret() {
  return process.env.AUTH_SECRET?.trim() || 'ubuzima-bwiza-dev-secret'
}

export function signToken(userId: string) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const body = `${userId}.${exp}`
  const sig = createHmac('sha256', secret()).update(body).digest('hex')
  return `${body}.${sig}`
}

export function readToken(token: string | undefined | null) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, exp, sig] = parts
  if (!userId || !exp || !sig) return null
  const body = `${userId}.${exp}`
  const expected = createHmac('sha256', secret()).update(body).digest('hex')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  if (Number(exp) < Date.now()) return null
  return userId
}

export function tokenFromHeader(header: string | undefined) {
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

export async function userFromAuthHeader(header: string | undefined): Promise<DbUser | null> {
  const userId = readToken(tokenFromHeader(header))
  if (!userId) return null
  await ensureDatabase()
  const row = await findUserById(userId)
  return row ? toPublicUser(row) : null
}

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString('hex')}`
}

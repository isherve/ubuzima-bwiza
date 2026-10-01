import type { VercelRequest, VercelResponse } from '@vercel/node'
import { registerAccount } from '../../server/records.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
    return
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const result = await registerAccount(body ?? {})
  res.status(result.status).json(result.body)
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { aiHistory } from '../../server/records.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
    return
  }
  const result = await aiHistory(req.headers.authorization)
  res.status(result.status).json(result.body)
}

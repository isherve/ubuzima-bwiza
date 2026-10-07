import type { VercelRequest, VercelResponse } from '@vercel/node'
import { rememberUssdInvoice } from '../server/ussd.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
    return
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body
  const result = await rememberUssdInvoice(body)
  res.status(result.ok ? 200 : 400).json(result)
}

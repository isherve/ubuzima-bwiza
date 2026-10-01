import type { VercelRequest, VercelResponse } from '@vercel/node'
import { appointmentsFor, bookAppointment } from '../../server/records.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = req.headers.authorization
  if (req.method === 'GET') {
    const result = await appointmentsFor(auth)
    res.status(result.status).json(result.body)
    return
  }
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const result = await bookAppointment(auth, body ?? {})
    res.status(result.status).json(result.body)
    return
  }
  res.status(405).json({ ok: false, message: 'Method not allowed' })
}

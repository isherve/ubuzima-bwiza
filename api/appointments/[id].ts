import type { VercelRequest, VercelResponse } from '@vercel/node'
import { changeAppointment } from '../../server/records.js'
import type { DbAppointment } from '../../server/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
    return
  }
  const id = String(req.query.id || '')
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const result = await changeAppointment(req.headers.authorization, id, {
    status: body?.status as DbAppointment['status'] | undefined,
    paymentMethod: body?.paymentMethod as DbAppointment['paymentMethod'] | undefined,
  })
  res.status(result.status).json(result.body)
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseContactPayload, sendContactEmail } from '../server/contact.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const payload = parseContactPayload(body)
    if (!payload) {
      res.status(400).json({ error: 'Please enter a valid name, email, and message.' })
      return
    }

    await sendContactEmail(payload)
    res.status(200).json({ success: true })
  } catch {
    res.status(502).json({ error: 'Could not send the message.' })
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { addConsultMessage, listConsultMessages } from '../server/consultChat.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const id = String(req.query.id ?? (typeof req.body === 'object' && req.body ? req.body.id : '') ?? '')
  if (!id) {
    res.status(400).json({ error: 'Missing consultation id' })
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({ messages: listConsultMessages(id) })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const message = addConsultMessage(id, {
      from: body?.from,
      role: body?.role,
      text: body?.text,
    })
    if (!message) {
      res.status(400).json({ error: 'Enter a message.' })
      return
    }
    res.status(200).json({ messages: listConsultMessages(id) })
  } catch {
    res.status(400).json({ error: 'Invalid request' })
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleAiChat, type ChatMessage } from '../../server/aiChat'

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
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]).slice(-12) : []
    const result = await handleAiChat(messages)
    res.status(200).json(result)
  } catch {
    res.status(400).json({ error: 'Invalid request body' })
  }
}

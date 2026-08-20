import type { Handler } from '@netlify/functions'
import { handleAiChat, type ChatMessage } from '../../server/aiChat'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}') as { messages?: ChatMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const result = await handleAiChat(messages)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }
}

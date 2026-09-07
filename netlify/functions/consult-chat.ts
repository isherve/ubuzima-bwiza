import type { Handler } from '@netlify/functions'
import { addConsultMessage, listConsultMessages } from '../../server/consultChat'

export const handler: Handler = async (event) => {
  const id = event.queryStringParameters?.id || JSON.parse(event.body || '{}').id
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing consultation id' }) }
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '' }
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: listConsultMessages(id) }),
    }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const body = JSON.parse(event.body || '{}') as { from?: string; role?: string; text?: string }
  const message = addConsultMessage(id, {
    from: body.from ?? '',
    role: body.role ?? '',
    text: body.text ?? '',
  })
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Enter a message.' }) }
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: listConsultMessages(id) }),
  }
}

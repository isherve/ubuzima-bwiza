import type { Handler } from '@netlify/functions'
import { parseContactPayload, sendContactEmail } from '../../server/contact'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const payload = parseContactPayload(JSON.parse(event.body || '{}'))
    if (!payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please enter a valid name, email, and message.' }),
      }
    }

    await sendContactEmail(payload)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    }
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not send the message.' }) }
  }
}

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { handleAiChat, type ChatMessage } from '../server/aiChat.ts'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

async function handleAiRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const raw = await readBody(req)
    const body = JSON.parse(raw || '{}') as { messages?: ChatMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const result = await handleAiChat(messages)
    sendJson(res, 200, result)
  } catch {
    sendJson(res, 400, { error: 'Invalid request body' })
  }
}

export function aiApiPlugin(): Plugin {
  return {
    name: 'ubuzima-bwiza-ai-api',
    configureServer(server) {
      server.middlewares.use('/api/ai/chat', (req, res) => {
        void handleAiRequest(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai/chat', (req, res) => {
        void handleAiRequest(req, res)
      })
    },
  }
}

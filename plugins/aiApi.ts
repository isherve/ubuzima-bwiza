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
  if (res.headersSent) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function isAiChatPath(req: IncomingMessage) {
  const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || ''
  const path = raw.split('?')[0]?.replace(/\/$/, '') || ''
  return path === '/api/ai/chat' || path.endsWith('/api/ai/chat')
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    sendJson(res, 500, { error: message })
  }
}

function attachAiApi(middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) {
  middlewares.use((req, res, next) => {
    if (!isAiChatPath(req)) {
      next()
      return
    }
    void handleAiRequest(req, res).catch((error) => {
      sendJson(res, 500, { error: error instanceof Error ? error.message : 'AI service error' })
    })
  })
}

export function aiApiPlugin(): Plugin {
  return {
    name: 'ubuzima-bwiza-ai-api',
    configureServer(server) {
      return () => {
        attachAiApi(server.middlewares)
      }
    },
    configurePreviewServer(server) {
      return () => {
        attachAiApi(server.middlewares)
      }
    },
  }
}

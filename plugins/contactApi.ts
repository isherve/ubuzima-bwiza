import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { parseContactPayload, sendContactEmail } from '../server/contact.ts'

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

function isContactPath(req: IncomingMessage) {
  const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || ''
  const path = raw.split('?')[0]?.replace(/\/$/, '') || ''
  return path === '/api/contact' || path.endsWith('/api/contact')
}

async function handleContactRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const payload = parseContactPayload(JSON.parse((await readBody(req)) || '{}'))
  if (!payload) {
    sendJson(res, 400, { error: 'Please enter a valid name, email, and message.' })
    return
  }

  await sendContactEmail(payload)
  sendJson(res, 200, { success: true })
}

function attachContactApi(middlewares: {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
}) {
  middlewares.use((req, res, next) => {
    if (!isContactPath(req)) {
      next()
      return
    }
    void handleContactRequest(req, res).catch(() => {
      sendJson(res, 502, { error: 'Could not send the message.' })
    })
  })
}

export function contactApiPlugin(): Plugin {
  return {
    name: 'ubuzima-bwiza-contact-api',
    configureServer(server) {
      return () => {
        attachContactApi(server.middlewares)
      }
    },
    configurePreviewServer(server) {
      return () => {
        attachContactApi(server.middlewares)
      }
    },
  }
}

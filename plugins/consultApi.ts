import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { addConsultMessage, listConsultMessages } from '../server/consultChat.ts'

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

function consultId(req: IncomingMessage, body?: { id?: string }) {
  const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || ''
  const query = new URL(raw, 'http://localhost').searchParams.get('id')
  return query || body?.id || ''
}

function isConsultPath(req: IncomingMessage) {
  const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || ''
  const path = raw.split('?')[0]?.replace(/\/$/, '') || ''
  return path === '/api/consult-chat' || path.endsWith('/api/consult-chat')
}

export function consultApiPlugin(): Plugin {
  return {
    name: 'ubuzima-bwiza-consult-api',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (!isConsultPath(req)) {
            next()
            return
          }
          void (async () => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 204
              res.end()
              return
            }
            if (req.method === 'GET') {
              const id = consultId(req)
              if (!id) {
                sendJson(res, 400, { error: 'Missing consultation id' })
                return
              }
              sendJson(res, 200, { messages: listConsultMessages(id) })
              return
            }
            if (req.method !== 'POST') {
              sendJson(res, 405, { error: 'Method not allowed' })
              return
            }
            const body = JSON.parse((await readBody(req)) || '{}') as {
              id?: string
              from?: string
              role?: string
              text?: string
            }
            const id = consultId(req, body)
            const message = addConsultMessage(id, {
              from: body.from ?? '',
              role: body.role ?? '',
              text: body.text ?? '',
            })
            if (!message) {
              sendJson(res, 400, { error: 'Enter a message.' })
              return
            }
            sendJson(res, 200, { messages: listConsultMessages(id) })
          })().catch(() => sendJson(res, 500, { error: 'Chat unavailable' }))
        })
      }
    },
  }
}

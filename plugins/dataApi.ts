import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import {
  aiHistory,
  appointmentsFor,
  bookAppointment,
  changeAppointment,
  currentSession,
  loginWithPassword,
  registerAccount,
} from '../server/records.ts'
import type { DbAppointment } from '../server/db.ts'

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

function requestPath(req: IncomingMessage) {
  const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || ''
  return raw.split('?')[0]?.replace(/\/$/, '') || ''
}

async function handleDataRequest(req: IncomingMessage, res: ServerResponse) {
  const path = requestPath(req)
  const auth = typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined
  const raw = req.method === 'GET' ? '{}' : await readBody(req)
  const body = JSON.parse(raw || '{}') as Record<string, string>

  if (path === '/api/auth/login' && req.method === 'POST') {
    const result = await loginWithPassword(body.email || '', body.password || '')
    sendJson(res, result.status, result.body)
    return
  }
  if (path === '/api/auth/register' && req.method === 'POST') {
    const result = await registerAccount(body)
    sendJson(res, result.status, result.body)
    return
  }
  if (path === '/api/auth/session' && req.method === 'GET') {
    const result = await currentSession(auth)
    sendJson(res, result.status, result.body)
    return
  }
  if (path === '/api/appointments' && req.method === 'GET') {
    const result = await appointmentsFor(auth)
    sendJson(res, result.status, result.body)
    return
  }
  if (path === '/api/appointments' && req.method === 'POST') {
    const result = await bookAppointment(auth, body)
    sendJson(res, result.status, result.body)
    return
  }
  if (path === '/api/ai/history' && req.method === 'GET') {
    const result = await aiHistory(auth)
    sendJson(res, result.status, result.body)
    return
  }

  const appointmentMatch = path.match(/^\/api\/appointments\/([^/]+)$/)
  if (appointmentMatch && req.method === 'PATCH') {
    const result = await changeAppointment(auth, decodeURIComponent(appointmentMatch[1] || ''), {
      status: body.status as DbAppointment['status'] | undefined,
      paymentMethod: body.paymentMethod as DbAppointment['paymentMethod'] | undefined,
    })
    sendJson(res, result.status, result.body)
    return
  }

  sendJson(res, 405, { ok: false, message: 'Method not allowed' })
}

function isDataPath(path: string) {
  return (
    path === '/api/auth/login' ||
    path === '/api/auth/register' ||
    path === '/api/auth/session' ||
    path === '/api/appointments' ||
    path === '/api/ai/history' ||
    /^\/api\/appointments\/[^/]+$/.test(path)
  )
}

function attach(middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) {
  middlewares.use((req, res, next) => {
    const path = requestPath(req)
    if (!isDataPath(path)) {
      next()
      return
    }
    void handleDataRequest(req, res).catch((error) => {
      sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : 'Request failed' })
    })
  })
}

export function dataApiPlugin(): Plugin {
  return {
    name: 'ubuzima-bwiza-data-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}

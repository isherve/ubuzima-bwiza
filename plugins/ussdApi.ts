import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { africastalkingUssd, rememberUssdInvoice, ussdFieldsFrom } from '../server/ussd.ts'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function requestPath(req: IncomingMessage) {
  const raw = (req as IncomingMessage & { originalUrl?: string }).originalUrl || req.url || ''
  return raw.split('?')[0]?.replace(/\/$/, '') || ''
}

function sendText(res: ServerResponse, status: number, body: string) {
  if (res.headersSent) return
  res.statusCode = status
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end(body)
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  if (res.headersSent) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

async function handleUssd(req: IncomingMessage, res: ServerResponse) {
  const path = requestPath(req)
  if (path === '/api/ussd' && req.method === 'GET') {
    sendText(res, 200, 'Ubuzima Bwiza Africa\'s Talking USSD callback. POST sessionId, serviceCode, phoneNumber and text.')
    return
  }
  if (req.method !== 'POST') {
    sendText(res, 405, 'END Method not allowed')
    return
  }
  const raw = await readBody(req)
  if (path === '/api/ussd-checkout') {
    const result = await rememberUssdInvoice(JSON.parse(raw || '{}') as Record<string, string>)
    sendJson(res, result.ok ? 200 : 400, result)
    return
  }
  sendText(res, 200, await africastalkingUssd(ussdFieldsFrom(raw)))
}

function attach(middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) {
  middlewares.use((req, res, next) => {
    const path = requestPath(req)
    if (path !== '/api/ussd' && path !== '/api/ussd-checkout') {
      next()
      return
    }
    void handleUssd(req, res).catch(() => {
      sendText(res, 500, 'END USSD session failed')
    })
  })
}

export function ussdApiPlugin(): Plugin {
  return {
    name: 'ubuzima-bwiza-ussd-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}

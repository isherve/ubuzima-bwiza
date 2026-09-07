export type ContactPayload = {
  name: string
  email: string
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_ORIGIN = 'https://healthline-nine.vercel.app'

function clean(value: unknown, max: number) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export function parseContactPayload(body: unknown): ContactPayload | null {
  const input = (body ?? {}) as Record<string, unknown>
  const name = clean(input.name, 80)
  const email = clean(input.email, 120).toLowerCase()
  const message = String(input.message ?? '')
    .trim()
    .slice(0, 4000)

  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 4) return null
  return { name, email, message }
}

function isSuccess(value: unknown) {
  return value === true || value === 'true'
}

export function originFromHeaders(headers: Record<string, string | string[] | undefined>) {
  const origin = headerValue(headers.origin)
  if (origin) return origin
  const host = headerValue(headers['x-forwarded-host']) || headerValue(headers.host)
  const proto = headerValue(headers['x-forwarded-proto']) || 'https'
  return host ? `${proto}://${host}` : DEFAULT_ORIGIN
}

function headerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

export async function sendContactEmail(payload: ContactPayload, origin?: string) {
  const to = process.env.CONTACT_TO?.trim() || 'ishimwehervin10@gmail.com'
  const site = origin?.replace(/\/$/, '') || process.env.CONTACT_ORIGIN?.trim() || DEFAULT_ORIGIN
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: site,
      Referer: `${site}/contact`,
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      _replyto: payload.email,
      _subject: `[Ubuzima Bwiza] Contact from ${payload.name}`,
      _template: 'table',
      _captcha: 'false',
    }),
  })

  const result = (await response.json()) as { success?: string | boolean; message?: string }
  if (!response.ok || !isSuccess(result.success)) {
    throw new Error(result.message || 'Could not send the message.')
  }
}

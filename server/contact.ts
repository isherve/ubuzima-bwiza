import { Resend } from 'resend'

export type ContactPayload = {
  name: string
  email: string
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

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

export async function sendContactEmail(payload: ContactPayload) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Contact email is not configured.')
  }

  const to = process.env.CONTACT_TO?.trim() || 'ishimwehervin10@gmail.com'
  const from =
    process.env.RESEND_FROM?.trim() || 'Ubuzima Bwiza <beth.t@example.com>'

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `[Ubuzima Bwiza] Contact from ${payload.name}`,
    text: `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`,
    html: `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p>${escapeHtml(payload.message).replaceAll('\n', '<br />')}</p>
    `,
  })

  if (error) {
    throw new Error(error.message || 'Resend failed to send the message.')
  }
}

const CONTACT_INBOX = 'ishimwehervin10@gmail.com'

function isSuccess(value: unknown) {
  return value === true || value === 'true'
}

export async function sendContactMessage(payload: {
  name: string
  email: string
  message: string
}) {
  const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_INBOX}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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

  const result = (await response.json()) as { success?: string | boolean }
  if (!response.ok || !isSuccess(result.success)) {
    throw new Error('Could not send the message.')
  }
}

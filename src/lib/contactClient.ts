export async function sendContactMessage(payload: {
  name: string
  email: string
  message: string
}) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Could not send the message.')
  }
}

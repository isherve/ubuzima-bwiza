export type AiChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AiDoctorSuggestion = {
  id: string
  name: string
  specialty: string
  hospital: string
  fee: number
}

export type AiChatResponse = {
  reply: string
  mode: 'local' | 'llm'
  specialty: string | null
  doctors: AiDoctorSuggestion[]
  warning?: string
}

export async function askHealthAi(messages: AiChatMessage[]): Promise<AiChatResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  const raw = await response.text()
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'AI API is not running. Restart the app with npm run dev and try again.'
        : 'AI service failed. Please try again.',
    )
  }

  try {
    return JSON.parse(raw) as AiChatResponse
  } catch {
    throw new Error('AI API is not running. Restart the app with npm run dev and try again.')
  }
}

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

  if (!response.ok) {
    throw new Error('AI service failed. Please try again.')
  }

  return (await response.json()) as AiChatResponse
}

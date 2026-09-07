export type ConsultMessage = {
  id: string
  from: string
  role: string
  text: string
  at: number
}

function storageKey(appointmentId: string) {
  return `ub_consult_${appointmentId}`
}

export function readLocalConsult(appointmentId: string): ConsultMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(appointmentId))
    return raw ? (JSON.parse(raw) as ConsultMessage[]) : []
  } catch {
    return []
  }
}

function saveLocalConsult(appointmentId: string, messages: ConsultMessage[]) {
  localStorage.setItem(storageKey(appointmentId), JSON.stringify(messages.slice(-80)))
}

function mergeMessages(a: ConsultMessage[], b: ConsultMessage[]) {
  const map = new Map<string, ConsultMessage>()
  for (const item of [...a, ...b]) map.set(item.id, item)
  return [...map.values()].sort((x, y) => x.at - y.at)
}

export async function loadConsultMessages(appointmentId: string) {
  const local = readLocalConsult(appointmentId)
  try {
    const response = await fetch(`/api/consult-chat?id=${encodeURIComponent(appointmentId)}`)
    if (!response.ok) return local
    const data = (await response.json()) as { messages?: ConsultMessage[] }
    const merged = mergeMessages(local, data.messages ?? [])
    saveLocalConsult(appointmentId, merged)
    return merged
  } catch {
    return local
  }
}

export async function postConsultMessage(
  appointmentId: string,
  input: { from: string; role: string; text: string },
) {
  const localMessage: ConsultMessage = {
    id: `local_${Date.now()}`,
    from: input.from,
    role: input.role,
    text: input.text.trim(),
    at: Date.now(),
  }
  const optimistic = mergeMessages(readLocalConsult(appointmentId), [localMessage])
  saveLocalConsult(appointmentId, optimistic)

  try {
    const response = await fetch('/api/consult-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appointmentId, ...input, text: localMessage.text }),
    })
    if (response.ok) {
      const data = (await response.json()) as { messages?: ConsultMessage[] }
      const merged = mergeMessages(optimistic, data.messages ?? [])
      saveLocalConsult(appointmentId, merged)
      return merged
    }
  } catch {
    // Keep the local copy so the sender still sees their message.
  }
  return optimistic
}

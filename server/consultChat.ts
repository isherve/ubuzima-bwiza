export type ConsultMessage = {
  id: string
  from: string
  role: string
  text: string
  at: number
}

const rooms = new Map<string, ConsultMessage[]>()

export function listConsultMessages(roomId: string) {
  return rooms.get(roomId) ?? []
}

export function addConsultMessage(roomId: string, input: { from: string; role: string; text: string }) {
  const text = String(input.text ?? '')
    .trim()
    .slice(0, 1000)
  const from = String(input.from ?? 'Guest').trim().slice(0, 80)
  const role = String(input.role ?? 'patient').slice(0, 20)
  if (!roomId || text.length < 1 || from.length < 1) return null

  const message: ConsultMessage = {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    from,
    role,
    text,
    at: Date.now(),
  }
  const next = [...(rooms.get(roomId) ?? []), message].slice(-80)
  rooms.set(roomId, next)
  return message
}

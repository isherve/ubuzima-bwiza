import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { User } from '../data'
import { loadConsultMessages, postConsultMessage, type ConsultMessage } from '../lib/consultChat'

const PATIENT_CHIPS = ["I'm ready for our visit", 'Can you hear me?', 'I will share my latest readings']
const DOCTOR_CHIPS = ['Please join the video when you are ready', 'I can see and hear you', 'Please share your latest readings']

export function ConsultChat({
  appointmentId,
  user,
  compact = false,
}: {
  appointmentId: string
  user: User
  compact?: boolean
}) {
  const [messages, setMessages] = useState<ConsultMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const chips = user.role === 'doctor' ? DOCTOR_CHIPS : PATIENT_CHIPS

  useEffect(() => {
    let alive = true
    const refresh = async () => {
      const next = await loadConsultMessages(appointmentId)
      if (alive) setMessages(next)
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 2500)
    const onStorage = (event: StorageEvent) => {
      if (event.key === `ub_consult_${appointmentId}`) void refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener('storage', onStorage)
    }
  }, [appointmentId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setInput('')
    const next = await postConsultMessage(appointmentId, {
      from: user.name,
      role: user.role,
      text: trimmed,
    })
    setMessages(next)
    setSending(false)
  }

  return (
    <div className={`consult-chat${compact ? ' compact' : ''}`}>
      <div className="consult-chat-log" ref={scroller}>
        {messages.length === 0 ? (
          <p className="meta">
            Send a message now. When you both start video, you can also chat inside the call.
          </p>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className={`chat-bubble ${item.from === user.name ? 'user' : 'peer'}`}
            >
              <div className="chat-text">
                <small>{item.from}</small>
                {item.text}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="quick-prompts msg-quick">
        {chips.map((chip) => (
          <button key={chip} type="button" onClick={() => void send(chip)} disabled={sending}>
            {chip}
          </button>
        ))}
      </div>
      <form
        className="msg-composer"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          void send(input)
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Write to your doctor or patient..."
          required
        />
        <button className="btn btn-primary" type="submit" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  )
}

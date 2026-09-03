import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { askHealthAi, type AiChatMessage, type AiDoctorSuggestion } from '../lib/aiClient'

type Bubble = {
  role: 'user' | 'ai' | 'doctor' | 'support'
  text: string
  doctors?: AiDoctorSuggestion[]
  specialty?: string | null
  time?: string
}

type Thread = {
  id: string
  title: string
  subtitle: string
  kind: 'ai' | 'doctor' | 'support'
}

const threads: Thread[] = [
  {
    id: 'ai',
    title: 'Ubuzima Bwiza AI',
    subtitle: 'Symptom triage & care guidance',
    kind: 'ai',
  },
  {
    id: 'doc-mugabo',
    title: 'Dr. Jean Mugabo',
    subtitle: 'Cardiology follow-up',
    kind: 'doctor',
  },
  {
    id: 'support',
    title: 'Ubuzima Bwiza Support',
    subtitle: 'Appointments & account help',
    kind: 'support',
  },
]

const seedMessages: Record<string, Bubble[]> = {
  ai: [
    {
      role: 'ai',
      text: 'Hi. I am your Ubuzima Bwiza AI. Ask about symptoms, medications, or which specialist to book.',
      time: 'Now',
    },
  ],
  'doc-mugabo': [
    {
      role: 'doctor',
      text: 'Please share your morning BP readings before Friday.',
      time: 'Yesterday',
    },
  ],
  support: [
    {
      role: 'support',
      text: 'Your appointment confirmation is ready. Reply if you need to reschedule.',
      time: '2 days ago',
    },
  ],
}

const quickPrompts = [
  'I have fever and headache for 2 days',
  'My child has a cough and mild fever',
  'Help me prepare questions for my cardiologist',
  'Ndashoje umutwe kandi mfite umuriro',
]

function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function DoctorSuggestions({
  doctors,
  specialty,
}: {
  doctors: AiDoctorSuggestion[]
  specialty?: string | null
}) {
  return (
    <div className="ai-docs">
      <p className="ai-docs-label">Suggested {specialty ? `${specialty} ` : ''}specialists</p>
      {doctors.map((doc) => (
        <div className="ai-doc-row" key={doc.id}>
          <div>
            <strong>{doc.name}</strong>
            <span>
              {doc.specialty} | {doc.hospital}
            </span>
          </div>
          <Link to={`/book/${doc.id}`} className="btn btn-primary">
            Book
          </Link>
        </div>
      ))}
    </div>
  )
}

type AiChatProps = {
  title?: string
  subtitle?: string
  compact?: boolean
}

export function AiChat({
  title = 'AI Health Assistant',
  subtitle = 'Preliminary guidance only. Not a replacement for a licensed clinician.',
  compact = false,
}: AiChatProps) {
  const [chat, setChat] = useState<Bubble[]>(seedMessages.ai)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'local' | 'llm' | null>(null)
  const [warning, setWarning] = useState('')
  const [consented, setConsented] = useState(() => localStorage.getItem('ub_ai_consent') === '1')
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [chat, loading])

  const send = async (text: string) => {
    const prompt = text.trim()
    if (!prompt || loading) return

    const history: AiChatMessage[] = [
      ...chat.map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      })),
      { role: 'user', content: prompt },
    ]

    setChat((prev) => [...prev, { role: 'user', text: prompt, time: 'Now' }])
    setInput('')
    setLoading(true)
    setWarning('')

    try {
      const result = await askHealthAi(history)
      setMode(result.mode)
      if (result.warning) setWarning(result.warning)
      setChat((prev) => [
        ...prev,
        {
          role: 'ai',
          text: result.reply,
          doctors: result.doctors,
          specialty: result.specialty,
          time: 'Now',
        },
      ])
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          role: 'ai',
          text: error instanceof Error ? error.message : 'AI service unavailable.',
          time: 'Now',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`stack ai-wrap${compact ? ' compact' : ''}`}>
      <div className="ai-header">
        <div>
          <h2>{title}</h2>
          <p className="lead">{subtitle}</p>
        </div>
        <span className={`ai-mode ${mode === 'llm' ? 'live' : 'local'}`}>
          {mode === 'llm' ? 'Live AI connected' : mode === 'local' ? 'Smart triage mode' : 'Ready'}
        </span>
      </div>

      {!consented ? (
        <div className="ai-consent" role="dialog" aria-labelledby="ai-consent-title">
          <h3 id="ai-consent-title">Before you use the AI assistant</h3>
          <p>
            This assistant offers preliminary guidance only. It is not a doctor, cannot diagnose, and
            must not replace emergency services. If you have chest pain, trouble breathing, stroke
            signs, or severe bleeding, call 112 / SAMU 912 or go to the nearest hospital immediately.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              localStorage.setItem('ub_ai_consent', '1')
              setConsented(true)
            }}
          >
            I understand — continue
          </button>
        </div>
      ) : null}

      {warning ? <p className="ai-warning">{warning}</p> : null}

      {!compact && consented ? (
        <div className="quick-prompts">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => void send(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      {consented ? (
      <form
        className="search-card auth-form ai-card"
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          void send(input)
        }}
      >
        <div className="chat" ref={scroller}>
          {chat.map((item, idx) => (
            <div key={idx} className={`chat-bubble ${item.role === 'user' ? 'user' : 'ai'}`}>
              <div className="chat-text">{renderText(item.text)}</div>
              {item.doctors && item.doctors.length > 0 ? (
                <DoctorSuggestions doctors={item.doctors} specialty={item.specialty} />
              ) : null}
            </div>
          ))}
          {loading ? <div className="chat-bubble ai typing">Thinking…</div> : null}
        </div>

        <div className="field">
          <label htmlFor={compact ? 'ai-prompt-mini' : 'ai-prompt'}>Message</label>
          <input
            id={compact ? 'ai-prompt-mini' : 'ai-prompt'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about symptoms, meds, or which doctor to book..."
            disabled={loading}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Analyzing…' : 'Send'}
        </button>
      </form>
      ) : null}
    </div>
  )
}

/** Full Messages inbox with AI as the primary chat thread. */
export function MessagesChat() {
  const [activeId, setActiveId] = useState('ai')
  const [inbox, setInbox] = useState<Record<string, Bubble[]>>(seedMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'local' | 'llm' | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [activeId],
  )
  const bubbles = inbox[activeId] ?? []

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [bubbles, loading, activeId])

  const send = async (text: string) => {
    const prompt = text.trim()
    if (!prompt || loading) return

    setInbox((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { role: 'user', text: prompt, time: 'Now' }],
    }))
    setInput('')

    if (active.kind === 'ai') {
      setLoading(true)
      const history: AiChatMessage[] = [
        ...(inbox[activeId] ?? []).map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        })),
        { role: 'user', content: prompt },
      ]
      try {
        const result = await askHealthAi(history)
        setMode(result.mode)
        setInbox((prev) => ({
          ...prev,
          [activeId]: [
            ...(prev[activeId] ?? []),
            {
              role: 'ai',
              text: result.reply,
              doctors: result.doctors,
              specialty: result.specialty,
              time: 'Now',
            },
          ],
        }))
      } catch (error) {
        setInbox((prev) => ({
          ...prev,
          [activeId]: [
            ...(prev[activeId] ?? []),
            {
              role: 'ai',
              text: error instanceof Error ? error.message : 'AI unavailable.',
              time: 'Now',
            },
          ],
        }))
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      const reply =
        active.kind === 'doctor'
          ? 'Thank you. I have noted your message. Please keep monitoring and we can review this at your next visit.'
          : 'Thanks for reaching out. A support agent will follow up shortly. You can also ask AI in the AI chat thread.'
      setInbox((prev) => ({
        ...prev,
        [activeId]: [
          ...(prev[activeId] ?? []),
          {
            role: active.kind === 'doctor' ? 'doctor' : 'support',
            text: reply,
            time: 'Now',
          },
        ],
      }))
      setLoading(false)
    }, 550)
  }

  const askAiToHelp = async () => {
    if (active.kind === 'ai' || loading) return
    const lastOther = [...bubbles].reverse().find((b) => b.role !== 'user')
    const prompt = lastOther
      ? `Help me write a clear patient reply to this message: "${lastOther.text}"`
      : 'Help me write a polite message to my doctor about my symptoms.'
    setLoading(true)
    try {
      const result = await askHealthAi([{ role: 'user', content: prompt }])
      setMode(result.mode)
      setInput(result.reply.replace(/\n\nDisclaimer:[\s\S]*$/i, '').trim())
    } catch {
      setInput('Thank you doctor. I will share my readings and update you if symptoms change.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="msg-layout">
      <aside className="msg-threads">
        <div className="msg-threads-head">
          <h2>Messages</h2>
          <span className={`ai-mode ${mode === 'llm' ? 'live' : 'local'}`}>
            {mode === 'llm' ? 'Live AI' : 'AI ready'}
          </span>
        </div>
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={`msg-thread${activeId === thread.id ? ' active' : ''}${thread.kind === 'ai' ? ' ai' : ''}`}
            onClick={() => setActiveId(thread.id)}
          >
            <strong>{thread.title}</strong>
            <span>{thread.subtitle}</span>
          </button>
        ))}
      </aside>

      <section className="msg-panel">
        <header className="msg-panel-head">
          <div>
            <h3>{active.title}</h3>
            <p>{active.subtitle}</p>
          </div>
          {active.kind !== 'ai' ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void askAiToHelp()}
              disabled={loading}
            >
              AI help reply
            </button>
          ) : null}
        </header>

        {active.kind === 'ai' ? (
          <div className="quick-prompts msg-quick">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => void send(prompt)} disabled={loading}>
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <div className="chat msg-chat" ref={scroller}>
          {bubbles.map((item, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${item.role === 'user' ? 'user' : item.role === 'ai' ? 'ai' : 'peer'}`}
            >
              <div className="chat-text">{renderText(item.text)}</div>
              {item.doctors && item.doctors.length > 0 ? (
                <DoctorSuggestions doctors={item.doctors} specialty={item.specialty} />
              ) : null}
            </div>
          ))}
          {loading ? <div className="chat-bubble ai typing">Thinking…</div> : null}
        </div>

        <form
          className="msg-composer"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            void send(input)
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              active.kind === 'ai'
                ? 'Ask AI about symptoms, meds, or specialists...'
                : `Message ${active.title}...`
            }
            disabled={loading}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            Send
          </button>
        </form>
      </section>
    </div>
  )
}

export function AiFloatingWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="ai-float">
      {open ? (
        <div className="ai-float-panel">
          <div className="ai-float-bar">
            <strong>AI Assistant</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close AI">
              Close
            </button>
          </div>
          <div className="ai-float-body">
            <AiChat compact title="Quick AI help" subtitle="Ask about symptoms or booking." />
          </div>
        </div>
      ) : null}
      <button type="button" className="ai-float-btn" onClick={() => setOpen((v) => !v)}>
        {open ? 'Close' : 'AI Chat'}
      </button>
    </div>
  )
}

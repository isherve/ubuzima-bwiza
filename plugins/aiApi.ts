import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { doctors } from '../src/data.ts'

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

const SYSTEM_PROMPT = `You are Ubuzima Bwiza's AI Health Assistant for patients in Rwanda.
Give clear, calm, practical guidance in plain language.
You are NOT a doctor and must not diagnose with certainty.
Always include a short disclaimer that this is preliminary guidance only.
If symptoms sound urgent (chest pain, severe breathing trouble, stroke signs, heavy bleeding, pregnancy emergencies), tell the user to seek emergency care immediately (call emergency services / go to nearest hospital).
When helpful, suggest a specialty (e.g. General practitioner, Pediatrician, Cardiologist) and encourage booking on Ubuzima Bwiza.
Keep answers concise (under 180 words) unless the user asks for more detail.
You may reply in English or Kinyarwanda if the user writes in that language.`

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function detectSpecialty(text: string): string | null {
  const t = text.toLowerCase()
  const rules: Array<[RegExp, string]> = [
    [/chest pain|heart attack|palpitation|blood pressure|hypertension/, 'Cardiologist'],
    [/child|baby|infant|pediatric|fever in (my )?kid/, 'Pediatrician'],
    [/pregnan|gyne|period|menstrual|antenatal|women'?s health/, 'Gynecologist'],
    [/skin|rash|acne|eczema|itch/, 'Dermatologist'],
    [/tooth|teeth|gum|dental|cavity/, 'Dental'],
    [/migraine|seizure|stroke|numbness|neurolog/, 'Neurologist'],
    [/eye|vision|blurry|ophthalm/, 'Ophthalmologist'],
    [/bone|joint|fracture|back pain|orthoped/, 'Orthopedic surgeon'],
    [/diabetes|thyroid|hormone|endocrin/, 'Endocrinologist'],
    [/ear|nose|throat|sinus|ent/, 'ENT surgeon'],
    [/cough|cold|flu|fever|fatigue|stomach|nausea|diarrhea|infection|headache/, 'General practitioner'],
  ]
  for (const [re, specialty] of rules) {
    if (re.test(t)) return specialty
  }
  return null
}

function isEmergency(text: string): boolean {
  return /chest pain|can't breathe|cannot breathe|difficulty breathing|stroke|unconscious|severe bleeding|suicidal|overdose|convulsion|heart attack/i.test(
    text,
  )
}

function localAssistantReply(messages: ChatMessage[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || ''
  if (!lastUser) {
    return {
      reply:
        'Please describe your symptoms, age group, and how long you have felt this way. I will suggest next steps.',
      mode: 'local' as const,
      specialty: null as string | null,
      doctors: [] as typeof doctors,
    }
  }

  if (isEmergency(lastUser)) {
    return {
      reply:
        'This may be urgent. Seek emergency care now — call emergency services or go to the nearest hospital. Do not wait for an online consultation. After you are safe, you can use Ubuzima Bwiza for follow-up with a specialist.\n\nDisclaimer: This is preliminary guidance only, not a medical diagnosis.',
      mode: 'local' as const,
      specialty: 'General practitioner',
      doctors: doctors.filter((d) => d.specialty === 'General practitioner').slice(0, 2),
    }
  }

  const specialty = detectSpecialty(lastUser) ?? 'General practitioner'
  const matches = doctors.filter((d) => d.specialty === specialty).slice(0, 2)
  const tips =
    specialty === 'Cardiologist'
      ? 'Avoid heavy exertion, note your blood pressure if possible, and book a cardiology review soon.'
      : specialty === 'Pediatrician'
        ? 'Keep the child hydrated, monitor fever, and seek care promptly if they become unusually sleepy or refuse fluids.'
        : specialty === 'Dental'
          ? 'Rinse gently with clean salt water and avoid very hot/cold drinks until you see a dentist.'
          : 'Rest, drink fluids, track symptoms for 24–48 hours, and book a clinician if they worsen or persist.'

  return {
    reply: `Thanks for sharing that. Based on what you described, a **${specialty}** consult on Ubuzima Bwiza is a sensible next step.\n\n${tips}\n\nI can help you prepare questions for your visit (onset, severity, medications, allergies). If symptoms suddenly worsen, seek urgent care.\n\nDisclaimer: This is preliminary AI guidance only — not a diagnosis or prescription.`,
    mode: 'local' as const,
    specialty,
    doctors: matches,
  }
}

function cleanApiKey(value?: string) {
  const key = value?.trim()
  if (!key) return ''
  if (
    key.length < 20 ||
    key.includes('...') ||
    key.includes('your_') ||
    key.includes('REPLACE') ||
    key === 'sk-' ||
    key === 'gsk_'
  ) {
    return ''
  }
  return key
}

async function llmReply(messages: ChatMessage[]) {
  const groqKey = cleanApiKey(process.env.GROQ_API_KEY)
  const openAiKey = cleanApiKey(process.env.OPENAI_API_KEY)
  const apiKey = groqKey || openAiKey
  if (!apiKey) return null

  const baseUrl = groqKey
    ? 'https://api.groq.com/openai/v1'
    : process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model =
    process.env.AI_MODEL ||
    (groqKey ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini')

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter((m) => m.role !== 'system')],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    const err = new Error(`AI provider error (${response.status}): ${errText.slice(0, 240)}`) as Error & {
      status?: number
    }
    err.status = response.status
    throw err
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('Empty AI response')

  const specialty = detectSpecialty(reply) || detectSpecialty(messages.at(-1)?.content || '')
  const matched = specialty
    ? doctors.filter((d) => d.specialty === specialty).slice(0, 2)
    : []

  return {
    reply,
    mode: 'llm' as const,
    specialty,
    doctors: matched,
  }
}

async function handleAiRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const raw = await readBody(req)
    const body = JSON.parse(raw || '{}') as { messages?: ChatMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []

    try {
      const llm = await llmReply(messages)
      if (llm) {
        sendJson(res, 200, llm)
        return
      }
    } catch (error) {
      const local = localAssistantReply(messages)
      const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 0
      // Invalid/missing keys should fail quietly to built-in triage.
      const warning =
        status === 401 || status === 403
          ? undefined
          : error instanceof Error
            ? 'Live AI temporarily unavailable. Using built-in triage.'
            : 'Live AI temporarily unavailable. Using built-in triage.'
      sendJson(res, 200, { ...local, warning })
      return
    }

    sendJson(res, 200, localAssistantReply(messages))
  } catch {
    sendJson(res, 400, { error: 'Invalid request body' })
  }
}

export function aiApiPlugin(): Plugin {
  // Ignore invalid keys inherited from the parent process/IDE.
  if (!cleanApiKey(process.env.OPENAI_API_KEY)) delete process.env.OPENAI_API_KEY
  if (!cleanApiKey(process.env.GROQ_API_KEY)) delete process.env.GROQ_API_KEY

  return {
    name: 'ubuzima-bwiza-ai-api',
    configureServer(server) {
      server.middlewares.use('/api/ai/chat', (req, res) => {
        void handleAiRequest(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai/chat', (req, res) => {
        void handleAiRequest(req, res)
      })
    },
  }
}

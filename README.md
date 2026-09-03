# Ubuzima Bwiza: full local copy

Complete front-end clone of the Ubuzima Bwiza experience with working demo auth and dashboards.

## Run

```bash
cd healthline
npm install
npm run dev
```

Open http://127.0.0.1:5173

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@ubuzimabwiza.com | patient123 |
| Doctor | doctor@ubuzimabwiza.com | doctor123 |
| Hospital | hospital@ubuzimabwiza.com | hospital123 |
| Admin | admin@ubuzimabwiza.com | admin123 |

## Included

- Marketing: home, doctors, doctor profile, booking, about, contact, privacy, terms, chronic care
- Auth: login, register, forgot password
- Patient: appointments, messages, medications, records, chronic care apply, AI assistant, profile
- Doctor: dashboard, appointments (approve/reject/complete), calendar, patients, availability, profile
- Hospital: overview, doctors, patients, reception appointments, reports, settings
- Admin: users, approvals, all appointments, announcements, settings

## AI Health Assistant

Open `/ai-assistant` for symptom triage + specialist booking suggestions.

Works immediately in **smart triage mode** (built-in).

To enable **live LLM** replies, copy `.env.example` to `.env` and add a key:

```bash
# Groq (recommended free/fast)
GROQ_API_KEY=gsk_...
AI_MODEL=llama-3.3-70b-versatile

# or OpenAI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

Then restart `npm run dev`.

# Ubuzima Bwiza

Localized healthcare web app for Rwanda: patient, doctor, hospital, and admin dashboards, appointment booking, and an AI health assistant in English, French, and Kinyarwanda.

Live app: https://healthline-nine.vercel.app

## Architecture

- **Web UI:** React, TypeScript, Vite. Role dashboards and a public AI assistant.
- **API:** Vercel serverless routes in `api/` (same routes run locally through Vite plugins).
- **Database:** PostgreSQL. Users, appointments, and AI chat messages are stored in Postgres, not in the browser.
- **AI:** `/api/ai/chat` uses Groq or OpenAI when a key is set. Without a key it still answers with the built-in triage rules. Signed-in chats are saved in `ai_messages`.

## Database

| Table | What it stores |
|---|---|
| `users` | Name, email, password hash, role (`patient`, `doctor`, `hospital`, `admin`) |
| `appointments` | Doctor, patient, time, status, fee in RWF, payment |
| `ai_messages` | Saved assistant turns for the signed-in user |

The first connection creates the tables and seeds the demo accounts and sample appointments.

## Run locally

```bash
npm install
copy .env.example .env
```

Set `DATABASE_URL` to your Postgres connection string, then:

```bash
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

## Features

- Marketing pages, login, and registration
- Patient appointments, payments, messages, and AI assistant
- Doctor approvals, hospital operations, and admin views
- Symptom triage with specialist suggestions
- English, French, and Kinyarwanda

## AI Health Assistant

Open `/ai-assistant`. It works without an API key (built-in triage). For a live model, set one of these in `.env` and restart:

```bash
GROQ_API_KEY=gsk_...
AI_MODEL=llama-3.3-70b-versatile

# or
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

## Deploy

- Frontend and API: Vercel (`vercel.json`). Set `DATABASE_URL` and `AUTH_SECRET` in the project environment.
- Database: Railway Postgres (or any hosted Postgres). Use the **public** connection string on Vercel.

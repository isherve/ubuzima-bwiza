# Ubuzima Bwiza

Localized healthcare web app for Rwanda. Patients book clinicians, doctors and hospitals run their own dashboards, and an AI health assistant triages symptoms in English, French, or Kinyarwanda.

**Live app:** https://healthline-nine.vercel.app  
**Repository:** https://github.com/isherve/ubuzima-bwiza

## Architecture

| Layer | What it is |
|---|---|
| Web UI | React 19, TypeScript, Vite. Responsive marketing site and role dashboards. |
| API | Vercel serverless routes in `api/`. The same routes run locally through Vite plugins. |
| Database | Neon PostgreSQL. Login, appointments, payments, and signed-in AI chats are stored in Postgres. |
| AI | `/api/ai/chat` calls Groq or OpenAI when a key is set. Without a key it uses built-in triage rules and still suggests a specialty. |

Passwords are stored as salted hashes. A signed token in the browser authorizes later API calls.

## Database

The API creates these tables on first connection and seeds the demo accounts.

| Table | Columns that matter | Relationships |
|---|---|---|
| `users` | `id`, `name`, `email`, `password_hash`, `role`, `phone`, `specialty`, `hospital` | A user is a `patient`, `doctor`, `hospital`, or `admin`. |
| `appointments` | doctor, patient name, `patient_user_id`, date, time, status, type, fee in RWF, payment status, receipt | Each booking belongs to one patient user and one doctor. |
| `ai_messages` | `user_id`, `role` (`user` or `assistant`), `content`, `created_at` | Each saved turn belongs to the signed-in user. |

Patients only receive their own appointments. Doctors receive visits assigned to them. Hospital and admin accounts can read the full appointment list.

## Features

- Public site: home, doctors, booking, about, contact, help, privacy, and terms
- Accounts: register, login, and role-based dashboards
- Patient: appointments, Mobile Money / card / cash checkout, messages, medications, records, chronic care, profile
- Doctor: approve or reject visits, calendar, patients, video visit room
- Hospital: reception, doctors, patients, and reports
- Admin: users, approvals, announcements, and editable site copy
- AI assistant at `/ai-assistant` with specialist suggestions and booking links
- Languages: English, French, and Kinyarwanda

## Run locally

Requires Node.js 20+.

```bash
npm install
copy .env.example .env
```

Set `DATABASE_URL` to a Postgres connection string (Neon, or any other hosted Postgres), then:

```bash
npm run dev
```

Open http://127.0.0.1:5173

## Demo logins

| Role | Email | Password |
|---|---|---|
| Patient | patient@ubuzimabwiza.com | patient123 |
| Doctor | doctor@ubuzimabwiza.com | doctor123 |
| Hospital | hospital@ubuzimabwiza.com | hospital123 |
| Admin | admin@ubuzimabwiza.com | admin123 |

## AI assistant

Open `/ai-assistant`. Triage works with no API key. For a live model, add one of these to `.env` and restart:

```bash
GROQ_API_KEY=gsk_...
AI_MODEL=llama-3.3-70b-versatile

# or
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

Signed-in conversations are saved in `ai_messages`.

## Deploy

The production site is the Vercel project `healthline`.

- `DATABASE_URL` points at the Neon database `ubuzima-db` (already connected to that project).
- `AUTH_SECRET` signs login tokens.
- `GROQ_API_KEY` is optional and turns on live model replies.

`vercel.json` builds the Vite app and serves the `api/` routes. Do not use a SQLite file on Vercel; the filesystem there does not keep data.

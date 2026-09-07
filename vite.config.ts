import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { aiApiPlugin } from './plugins/aiApi.ts'
import { contactApiPlugin } from './plugins/contactApi.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Only apply non-empty keys so blank .env values never override.
  if (env.GROQ_API_KEY?.trim()) process.env.GROQ_API_KEY = env.GROQ_API_KEY.trim()
  if (env.OPENAI_API_KEY?.trim()) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY.trim()
  if (env.OPENAI_BASE_URL?.trim()) process.env.OPENAI_BASE_URL = env.OPENAI_BASE_URL.trim()
  if (env.AI_MODEL?.trim()) process.env.AI_MODEL = env.AI_MODEL.trim()
  if (env.RESEND_API_KEY?.trim()) process.env.RESEND_API_KEY = env.RESEND_API_KEY.trim()
  if (env.RESEND_FROM?.trim()) process.env.RESEND_FROM = env.RESEND_FROM.trim()
  if (env.CONTACT_TO?.trim()) process.env.CONTACT_TO = env.CONTACT_TO.trim()

  const githubPages = process.env.GITHUB_PAGES === 'true'

  return {
    base: githubPages ? '/ubuzima-bwiza/' : '/',
    plugins: [react(), aiApiPlugin(), contactApiPlugin()],
    server: {
      port: 5173,
      host: true,
    },
  }
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { aiApiPlugin } from './plugins/aiApi.ts'
import { contactApiPlugin } from './plugins/contactApi.ts'
import { consultApiPlugin } from './plugins/consultApi.ts'
import { dataApiPlugin } from './plugins/dataApi.ts'
import { ussdApiPlugin } from './plugins/ussdApi.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Only apply non-empty keys so blank .env values never override.
  if (env.GROQ_API_KEY?.trim()) process.env.GROQ_API_KEY = env.GROQ_API_KEY.trim()
  if (env.OPENAI_API_KEY?.trim()) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY.trim()
  if (env.OPENAI_BASE_URL?.trim()) process.env.OPENAI_BASE_URL = env.OPENAI_BASE_URL.trim()
  if (env.AI_MODEL?.trim()) process.env.AI_MODEL = env.AI_MODEL.trim()
  if (env.CONTACT_TO?.trim()) process.env.CONTACT_TO = env.CONTACT_TO.trim()
  if (env.DATABASE_URL?.trim()) process.env.DATABASE_URL = env.DATABASE_URL.trim()
  if (env.AUTH_SECRET?.trim()) process.env.AUTH_SECRET = env.AUTH_SECRET.trim()
  if (env.AT_SERVICE_CODE?.trim()) process.env.AT_SERVICE_CODE = env.AT_SERVICE_CODE.trim()
  if (env.AT_USERNAME?.trim()) process.env.AT_USERNAME = env.AT_USERNAME.trim()
  if (env.AT_API_KEY?.trim()) process.env.AT_API_KEY = env.AT_API_KEY.trim()

  const githubPages = process.env.GITHUB_PAGES === 'true'

  return {
    base: githubPages ? '/ubuzima-bwiza/' : '/',
    plugins: [react(), dataApiPlugin(), ussdApiPlugin(), aiApiPlugin(), contactApiPlugin(), consultApiPlugin()],
    server: {
      port: 5173,
      host: true,
      allowedHosts: true,
    },
  }
})

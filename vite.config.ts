import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { aiApiPlugin } from './plugins/aiApi.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Only apply non-empty keys so blank .env values never override.
  if (env.GROQ_API_KEY?.trim()) process.env.GROQ_API_KEY = env.GROQ_API_KEY.trim()
  if (env.OPENAI_API_KEY?.trim()) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY.trim()
  if (env.OPENAI_BASE_URL?.trim()) process.env.OPENAI_BASE_URL = env.OPENAI_BASE_URL.trim()
  if (env.AI_MODEL?.trim()) process.env.AI_MODEL = env.AI_MODEL.trim()

  const githubPages = process.env.GITHUB_PAGES === 'true'

  return {
    base: githubPages ? '/ubuzima-bwiza/' : '/',
    plugins: [react(), aiApiPlugin()],
    server: {
      port: 5173,
    },
  }
})

const TOKEN_KEY = 'ub_token'

export function authToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<{ ok: boolean; data: T }> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = authToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(path, { ...options, headers })
  const data = (await response.json().catch(() => ({}))) as T
  return { ok: response.ok, data }
}

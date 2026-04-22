import axios from 'axios'

const TOKEN_KEY = 'tw_access_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

// En dev, si VITE_API_BASE_URL est vide, on utilise les URLs relatives.
// Le proxy Vite (vite.config.ts) redirige /auth, /tickets, /workflows vers http://localhost:3000.
const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
function isPublicRequest(url: string) {
  return publicPaths.some((p) => url.includes(p))
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url ?? ''
    const is401 = err?.response?.status === 401
    if (is401 && url && !isPublicRequest(url)) {
      setStoredToken(null)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(err)
  },
)

export function asApiErrorMessage(err: any): string {
  if (err?.response?.status === 401) {
    return 'Session expirée. Veuillez vous reconnecter.'
  }
  if (err?.response?.status === 403) {
    return 'Vous n’avez pas les droits pour effectuer cette action.'
  }
  const msg = err?.response?.data?.message
  if (Array.isArray(msg)) return msg.join('\n')
  if (typeof msg === 'string') return msg
  return err?.message ?? 'Une erreur est survenue'
}

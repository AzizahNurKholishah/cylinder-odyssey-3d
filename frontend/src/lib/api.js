const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const TOKEN_KEY = 'co3d_token'

export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* storage diblokir */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* storage diblokir */ }
  },
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'network', 'Tidak dapat terhubung ke server. Periksa koneksi internetmu.')
  }
  let data = null
  try { data = await res.json() } catch { /* bukan JSON */ }
  if (!res.ok) {
    const detail = data?.detail || {}
    if (res.status === 401 && token) {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:expired'))
    }
    throw new ApiError(res.status, detail.code || 'error', detail.message || 'Terjadi kesalahan. Coba lagi.')
  }
  return data
}

export const API = {
  login: (student_code, access_key) => api('/auth/login', { method: 'POST', body: { student_code, access_key } }),
  me: () => api('/auth/me'),
  dashboard: () => api('/me/dashboard'),
  profile: () => api('/me/profile'),
  lessons: () => api('/lessons'),
  completeLesson: (slug) => api(`/lessons/${slug}/complete`, { method: 'POST' }),
  practiceList: () => api('/practice/questions'),
  practiceQuestion: (id) => api(`/practice/questions/${id}`),
  practiceAttempt: (id, payload) => api(`/practice/questions/${id}/attempt`, { method: 'POST', body: payload }),
  saveReflection: (attemptId, text) => api(`/practice/attempts/${attemptId}/reflection`, { method: 'POST', body: { text } }),
  evaluationQuestions: () => api('/evaluation/questions'),
  submitEvaluation: (answers) => api('/evaluation/submit', { method: 'POST', body: { answers } }),
  latestEvaluation: () => api('/evaluation/latest'),
  games: () => api('/games'),
  submitGame: (slug, score) => api(`/games/${slug}/attempts`, { method: 'POST', body: { score } }),
  labExplored: (feature) => api('/lab/explored', { method: 'POST', body: { feature } }),
  adminStudents: () => api('/admin/students'),
  adminCreateStudent: (payload) => api('/admin/students', { method: 'POST', body: payload }),
}

// Talks to our Express backend. Every service uses apiRequest().
// The login token is kept in localStorage and sent as "Authorization: Bearer <token>".
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const TOKEN_KEY = 'token'

export const getToken = () => loadFromStorage(TOKEN_KEY, '')
export const saveToken = (token) => saveToStorage(TOKEN_KEY, token)
export const clearToken = () => removeFromStorage(TOKEN_KEY)

// Sends a request and returns the JSON answer.
// On an error it throws Error(message) with the server's own message, so pages can show it.
// timeoutMs (optional): give up after this long, e.g. for slow AI requests.
export async function apiRequest(method, path, body, { timeoutMs } = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const signal = timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined

  let response
  try {
    response = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal })
  } catch (fetchError) {
    if (fetchError.name === 'TimeoutError') throw new Error('The request took too long. Please try again.', { cause: fetchError })
    throw new Error("Can't reach the server. Is it running?", { cause: fetchError })
  }

  const data = await response.json().catch(() => ({}))

  // The saved login is no longer valid (expired, or the account was deleted): log out
  if (response.status === 401 && token) {
    clearToken()
    if (window.location.pathname !== '/login') window.location.assign('/login')
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }
  return data
}

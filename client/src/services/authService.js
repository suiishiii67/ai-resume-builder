// Login, signup and profile, using the backend (/api/auth and /api/users).
import { apiRequest, getToken, saveToken, clearToken } from './api'

// Returns the user. The token is saved so the user stays logged in after a refresh.
export async function login(email, password) {
  const { token, user } = await apiRequest('POST', '/auth/login', { email: email.trim(), password })
  saveToken(token)
  return user
}

export async function signup({ name, email, password }) {
  const { token, user } = await apiRequest('POST', '/auth/signup', { name: name.trim(), email: email.trim(), password })
  saveToken(token)
  return user
}

// The server keeps no sessions, so logging out just forgets the token
export async function logout() {
  clearToken()
}

// The logged-in user, or null (no token, or the token is no longer valid)
export async function getCurrentUser() {
  if (!getToken()) return null
  try {
    const { user } = await apiRequest('GET', '/auth/me')
    return user
  } catch {
    clearToken()
    return null
  }
}

// userId is not needed: the server knows the user from the token
export async function updateProfile(_userId, { name, email }) {
  const { user } = await apiRequest('PATCH', '/users/me', { name, email })
  return user
}

export async function changePassword(_userId, currentPassword, newPassword) {
  await apiRequest('PATCH', '/users/me/password', { currentPassword, newPassword })
  return true
}

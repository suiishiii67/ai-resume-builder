// Keeps an uploaded resume in sessionStorage while the user logs in.
// sessionStorage is cleared when the tab is closed.
const PENDING_KEY = 'arb_pendingResume'

export function savePendingResume(resume) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(resume))
  } catch {
    // Storage blocked: the user can upload again after logging in
  }
}

// Returns the saved resume (or null) and removes it, so it is only used once
export function takePendingResume() {
  try {
    const savedText = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    return savedText ? JSON.parse(savedText) : null
  } catch {
    return null
  }
}

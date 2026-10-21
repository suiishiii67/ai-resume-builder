// Saves and loads small things in the browser (localStorage), like the login token.
const PREFIX = 'arb_'

export function loadFromStorage(key, fallbackValue) {
  try {
    const savedText = localStorage.getItem(PREFIX + key)
    return savedText ? JSON.parse(savedText) : fallbackValue
  } catch {
    return fallbackValue
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage blocked or full: keep working for this session
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // Storage blocked
  }
}

// Helpers for the rule-based AI demo (Promise + short delay) and ids for new resume entries.
// Returns a copy of result after a short delay
export function simulateRequest(result, delayMs = 400) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result === undefined ? undefined : structuredClone(result)), delayMs)
  })
}

// Unique id like "exp-lq3k9-x7a2" for experience, project, education and certificate entries
export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

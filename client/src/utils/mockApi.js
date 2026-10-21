// Unique id like "exp-lq3k9-x7a2" for experience, project, education and certificate entries
// (the editor uses these ids; MongoDB makes the ids of whole resumes).
export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

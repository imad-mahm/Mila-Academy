// Standalone so lib/auth.ts (which writes the session) and lib/use-session.ts
// (which reads it) don't have to import each other — that cycle worked, but
// only because every use was deferred inside a function body.

export const SESSION_CHANGE_EVENT = 'mila_session_changed'

/** Bumped on every session write; the store uses it to invalidate its cache. */
let revision = 0

export function sessionRevision(): number {
  return revision
}

/** Call after any write to the session so subscribers in this tab re-read it. */
export function notifySessionChanged(): void {
  revision += 1
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT))
}

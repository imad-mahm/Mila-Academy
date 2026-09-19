'use client'
import { useSyncExternalStore } from 'react'
import { getCurrentUser, type SessionUser, type AcademyFilter } from './auth'
import { SESSION_CHANGE_EVENT, sessionRevision } from './session-events'

// The dashboard layout, useRequireAccess and the student detail page each used
// to read the session out of localStorage inside their own `useEffect` and copy
// it into `useState`. That is a setState-in-effect (a React 19 lint error), it
// renders once with the wrong value before correcting itself, and the copies
// could drift apart. This exposes the session as one external store instead.

const SESSION_KEY = 'mila_user'

const listeners = new Set<() => void>()

// useSyncExternalStore re-renders whenever getSnapshot returns a new reference,
// so the parsed object has to be cached — getCurrentUser() parses fresh JSON on
// every call and would otherwise loop forever.
let cachedRaw: string | null = null
let cachedRevision = -1
let cachedUser: SessionUser | null = null

function getSnapshot(): SessionUser | null {
  let raw: string | null = null
  try { raw = localStorage.getItem(SESSION_KEY) } catch {}
  const rev = sessionRevision()
  if (raw !== cachedRaw || rev !== cachedRevision) {
    cachedRaw = raw
    cachedRevision = rev
    cachedUser = getCurrentUser()
  }
  return cachedUser
}

/** The server can't see localStorage, so it renders the "not known yet" state. */
function getServerSnapshot(): SessionUser | null {
  return null
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  const notify = () => { cb() }
  // `storage` covers other tabs; the custom event covers this one.
  window.addEventListener('storage', notify)
  window.addEventListener(SESSION_CHANGE_EVENT, notify)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', notify)
    window.removeEventListener(SESSION_CHANGE_EVENT, notify)
  }
}

/**
 * The current session, or null.
 *
 * Null means "no session" on the client, but also "not determined yet" during
 * the server render and the hydration pass — so callers gate their redirect on
 * `ready` rather than acting on the first null they see.
 */
export function useSession(): { user: SessionUser | null; ready: boolean } {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { user, ready: useHydratedInternal() }
}

// True only after hydration, so we can tell "no session" apart from
// "hasn't read localStorage yet" without a setState-in-effect.
function useHydratedInternal(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

/**
 * False during the server render and the hydration pass, true afterwards.
 *
 * Lets a component defer browser-only values (today's date, localStorage) to
 * after hydration without a setState-in-effect. Important here because the
 * dashboard pages are statically prerendered, so anything derived from `new
 * Date()` at render time would otherwise bake the *build* date into the HTML.
 */
export function useHydrated(): boolean {
  return useHydratedInternal()
}

/**
 * The academy filter chosen in the sidebar switcher.
 *
 * Every dashboard page used to mirror this into its own `useState`, seeded from
 * `getCurrentUser()` in the initialiser and resynced via a
 * `mila_academy_changed` listener. Because these pages are prerendered, the
 * server render always produced 'Both' and the page visibly flipped to the real
 * selection after hydration.
 */
export function useSelectedAcademy(): AcademyFilter {
  const { user } = useSession()
  return user?.selectedAcademy ?? 'Both'
}

import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'mila_session'

/**
 * Checks the same cookie the client-side dashboard auth (lib/auth.ts) sets.
 * NOTE: this cookie is a plain, unsigned JSON blob the browser could forge —
 * this is only as secure as the existing dashboard login, not a real
 * server-verified session. Treat replacing it with real auth as a priority.
 */
export async function isAdminRequest(): Promise<boolean> {
  return requireRole('admin')
}

type Role = 'admin' | 'coach' | 'parent' | 'student'

/** Reads just the role out of the session cookie, or null if not logged in / unparseable. */
export async function getSessionRole(): Promise<Role | null> {
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return parsed?.role ?? null
  } catch {
    return null
  }
}

/** True if the session's role is one of `allowed`. */
export async function requireRole(...allowed: Role[]): Promise<boolean> {
  const role = await getSessionRole()
  return role !== null && allowed.includes(role)
}

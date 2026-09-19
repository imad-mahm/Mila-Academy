import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'mila_session'

type Role = 'admin' | 'coach' | 'parent' | 'student'

export interface ApiSession {
  id: string
  role: Role
  /** The student this account is linked to (parent / student roles). */
  studentId: string | null
}

/**
 * Reads the same cookie the client-side dashboard auth (lib/auth.ts) sets.
 *
 * NOTE: this cookie is a plain, unsigned JSON blob the browser could forge —
 * it is only as strong as the existing dashboard login, not a real
 * server-verified session. Treat replacing it with real auth as a priority.
 * The checks below still matter: they stop an ordinary logged-in parent from
 * reading another family's record by changing the id in the URL.
 */
export async function getSession(): Promise<ApiSession | null> {
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    const role = parsed?.role
    if (role !== 'admin' && role !== 'coach' && role !== 'parent' && role !== 'student') {
      return null
    }
    return {
      id: String(parsed.id ?? ''),
      role,
      studentId: parsed.sid != null ? String(parsed.sid) : null,
    }
  } catch {
    return null
  }
}

/** Reads just the role out of the session cookie, or null if not logged in. */
export async function getSessionRole(): Promise<Role | null> {
  return (await getSession())?.role ?? null
}

/** True if the session's role is one of `allowed`. */
export async function requireRole(...allowed: Role[]): Promise<boolean> {
  const role = await getSessionRole()
  return role !== null && allowed.includes(role)
}

export async function isAdminRequest(): Promise<boolean> {
  return requireRole('admin')
}

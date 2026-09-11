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
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  if (!raw) return false
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return parsed?.role === 'admin'
  } catch {
    return false
  }
}

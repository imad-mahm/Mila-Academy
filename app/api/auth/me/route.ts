import { NextResponse } from 'next/server'
import { getSession } from '@/lib/api-auth'
import { sessionUserFor } from '@/lib/server/users'
import { unauthorized } from '@/lib/api-fields'

// The dashboard calls this on load to refresh its cached copy of the session,
// so a role/name/academy change made by an admin shows up without re-login,
// and a disabled or reset account is signed out.
export async function GET() {
  const session = await getSession()
  if (!session) return unauthorized()
  return NextResponse.json({ user: sessionUserFor(session.user) })
}

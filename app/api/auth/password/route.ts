import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSession, setSessionCookie } from '@/lib/api-auth'
import { readJson, badRequest, unauthorized, dbError } from '@/lib/api-fields'
import { hashPassword, verifyPassword, passwordProblem } from '@/lib/server/passwords'
import { sessionUserFor, type UserRecord } from '@/lib/server/users'

// Change your own password. Signs out every other session (the version bump)
// and re-issues this one so the caller stays signed in.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const current = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const next = body.newPassword
  if (!(await verifyPassword(current, session.user.password_hash))) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
  }
  const problem = passwordProblem(next)
  if (problem) return badRequest(problem)
  if (next === current) return badRequest('New password must be different from the current one')

  const { data, error } = await getSupabaseAdmin()
    .from('app_users')
    .update({
      password_hash: await hashPassword(next as string),
      must_change_password: false,
      session_version: session.user.session_version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.id)
    .select('*')
    .single()
  if (error) return dbError('auth.password', error)

  const user = data as UserRecord
  await setSessionCookie(user)
  return NextResponse.json({ user: sessionUserFor(user) })
}

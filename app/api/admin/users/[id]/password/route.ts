import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'
import { hashPassword, passwordProblem } from '@/lib/server/passwords'
import { findUserById } from '@/lib/server/users'
import { temporaryPassword } from '../../validate'

// Admin password reset. Sets a temporary password (the one given, or a
// generated one), signs the user out everywhere, and makes them choose a new
// password on next sign-in. The temporary password is returned once.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const body = (await readJson(req)) ?? {}
  const given = typeof body.password === 'string' && body.password !== '' ? body.password : null
  if (given) {
    const problem = passwordProblem(given)
    if (problem) return badRequest(problem)
  }

  const target = await findUserById(id).catch(() => null)
  if (!target) return notFound('User not found')

  const password = given ?? temporaryPassword()
  const { error } = await getSupabaseAdmin()
    .from('app_users')
    .update({
      password_hash: await hashPassword(password),
      must_change_password: true,
      session_version: target.session_version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return dbError('users.password', error)
  return NextResponse.json({ temporaryPassword: password })
}

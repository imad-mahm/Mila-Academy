import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { clearCoachScopeCache } from '@/lib/server/coach-scope'
import { COACH_FIELDS, pick, readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'

// Also used to archive/restore — pass { archived_at: <ISO string> } to archive,
// or { archived_at: null } to restore.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireRole('admin'))) return unauthorized()

  const { id } = await params
  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const values = pick(body, COACH_FIELDS)
  if (Object.keys(values).length === 0) return badRequest('No updatable fields provided')

  const { data, error } = await getSupabaseAdmin()
    .from('coaches').update(values).eq('id', id).select().maybeSingle()
  if (error) return dbError('coaches.update', error)
  if (!data) return notFound('Coach not found')
  clearCoachScopeCache()
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireRole('admin'))) return unauthorized()

  const { id } = await params
  const db = getSupabaseAdmin()
  const { data: coach } = await db.from('coaches').select('email').eq('id', id).maybeSingle()
  const { error, count } = await db.from('coaches').delete({ count: 'exact' }).eq('id', id)
  if (error) return dbError('coaches.delete', error)
  if (!count) return notFound('Coach not found')
  // Remove the matching coach sign-in too, otherwise it would linger with
  // academy-wide access and no team limit. Only coach-role accounts, never admins.
  const email = String(coach?.email ?? '').trim().toLowerCase()
  if (email) {
    await db.from('app_users').delete().eq('role', 'coach').ilike('email', email.replace(/[\\%_]/g, c => `\\${c}`))
  }
  clearCoachScopeCache()
  return NextResponse.json({ ok: true })
}

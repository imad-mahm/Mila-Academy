import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { TEAM_FIELDS, pick, readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireRole('admin'))) return unauthorized()

  const { id } = await params
  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const values = pick(body, TEAM_FIELDS)
  if (Object.keys(values).length === 0) return badRequest('No updatable fields provided')

  const { data, error } = await getSupabaseAdmin()
    .from('teams').update(values).eq('id', id).select().maybeSingle()
  if (error) return dbError('teams.update', error)
  if (!data) return notFound('Team not found')
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireRole('admin'))) return unauthorized()

  const { id } = await params
  const { error, count } = await getSupabaseAdmin()
    .from('teams').delete({ count: 'exact' }).eq('id', id)
  if (error) return dbError('teams.delete', error)
  if (!count) return notFound('Team not found')
  return NextResponse.json({ ok: true })
}

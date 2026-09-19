import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { pick, readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'
import { PROGRAMS_FIELDS } from '../route'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  // Only the fields actually sent. This used to write every column on every
  // PATCH, so updating one field blanked the rest of the row.
  const values = pick(body, PROGRAMS_FIELDS)
  if (Object.keys(values).length === 0) return badRequest('No updatable fields provided')

  const { data, error } = await getSupabaseAdmin()
    .from('programs')
    .update(values)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) return dbError('programs.update', error)
  if (!data) return notFound('Program not found')
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const { error, count } = await getSupabaseAdmin()
    .from('programs').delete({ count: 'exact' }).eq('id', id)

  if (error) return dbError('programs.delete', error)
  if (!count) return notFound('Program not found')
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidateSite } from '@/lib/server/revalidate'
import { readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'
import { programValues } from '../validate'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  // Only the fields actually sent, so updating one field leaves the rest alone.
  const result = programValues(body, true)
  if ('error' in result) return badRequest(result.error)
  if (Object.keys(result.values).length === 0) return badRequest('No updatable fields provided')

  const { data, error } = await getSupabaseAdmin()
    .from('programs')
    .update(result.values)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) return dbError('programs.update', error)
  if (!data) return notFound('Program not found')
  revalidateSite()
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const { error, count } = await getSupabaseAdmin()
    .from('programs').delete({ count: 'exact' }).eq('id', id)

  if (error) return dbError('programs.delete', error)
  if (!count) return notFound('Program not found')
  revalidateSite()
  return NextResponse.json({ ok: true })
}

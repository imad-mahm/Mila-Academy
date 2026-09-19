import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { COACH_FIELDS, pick, readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'

export async function GET(req: NextRequest) {
  if (!(await requireRole('admin', 'coach'))) return unauthorized()

  const includeArchived = req.nextUrl.searchParams.get('includeArchived') === '1'

  let query = getSupabaseAdmin().from('coaches').select('*').order('name', { ascending: true })
  if (!includeArchived) query = query.is('archived_at', null)

  const { data, error } = await query
  if (error) return dbError('coaches.list', error)
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await requireRole('admin'))) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')
  if (typeof body.name !== 'string' || !body.name.trim()) {
    return badRequest('name is required')
  }

  const values = pick(body, COACH_FIELDS)
  values.name = body.name.trim()

  const { data, error } = await getSupabaseAdmin().from('coaches').insert(values).select().single()
  if (error) return dbError('coaches.create', error)
  return NextResponse.json({ data }, { status: 201 })
}

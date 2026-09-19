import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { STUDENT_FIELDS, pick, readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'

// ?includeArchived=1 to also return archived students (default: active only)
export async function GET(req: NextRequest) {
  if (!(await requireRole('admin', 'coach'))) return unauthorized()

  const includeArchived = req.nextUrl.searchParams.get('includeArchived') === '1'

  let query = getSupabaseAdmin().from('students').select('*').order('name', { ascending: true })
  if (!includeArchived) query = query.is('archived_at', null)

  const { data, error } = await query
  if (error) return dbError('students.list', error)
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await requireRole('admin', 'coach'))) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const { name, academy } = body
  if (typeof name !== 'string' || !name.trim()) {
    return badRequest('name is required')
  }
  if (academy !== 'MFA' && academy !== 'MBA') {
    return badRequest('academy must be MFA or MBA')
  }

  // Whitelisted: the body used to be inserted wholesale, so a caller could set
  // `id`, `created_at` or `archived_at` directly.
  const values = pick(body, STUDENT_FIELDS)
  values.name = name.trim()

  const { data, error } = await getSupabaseAdmin().from('students').insert(values).select().single()
  if (error) return dbError('students.create', error)
  return NextResponse.json({ data }, { status: 201 })
}

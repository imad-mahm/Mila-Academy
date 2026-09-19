import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { pick, readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'

export const PROGRAMS_FIELDS = ['sport', 'name', 'subtitle', 'age_range', 'frequency', 'price_month', 'sort_order'] as const

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()

  const { data, error } = await getSupabaseAdmin()
    .from('programs')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return dbError('programs.list', error)
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  if (body.sport !== 'football' && body.sport !== 'basketball') {
    return badRequest('sport must be football or basketball')
  }

  if (typeof body.name !== 'string' || !body.name.trim()) {
    return badRequest('name is required')
  }

  const { data, error } = await getSupabaseAdmin()
    .from('programs')
    .insert(pick(body, PROGRAMS_FIELDS))
    .select()
    .single()

  if (error) return dbError('programs.create', error)
  return NextResponse.json({ data }, { status: 201 })
}

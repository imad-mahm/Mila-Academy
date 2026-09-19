import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { TEAM_FIELDS, pick, readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'

export async function GET() {
  if (!(await requireRole('admin', 'coach'))) return unauthorized()

  const { data, error } = await getSupabaseAdmin().from('teams').select('*').order('name', { ascending: true })
  if (error) return dbError('teams.list', error)
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await requireRole('admin'))) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')
  if (typeof body.name !== 'string' || !body.name.trim()) {
    return badRequest('name is required')
  }
  if (body.academy !== 'MFA' && body.academy !== 'MBA') {
    return badRequest('academy must be MFA or MBA')
  }

  const values = pick(body, TEAM_FIELDS)
  values.name = body.name.trim()

  const { data, error } = await getSupabaseAdmin().from('teams').insert(values).select().single()
  if (error) return dbError('teams.create', error)
  return NextResponse.json({ data }, { status: 201 })
}

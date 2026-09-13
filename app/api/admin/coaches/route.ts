import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  if (!(await requireRole('admin', 'coach'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const includeArchived = req.nextUrl.searchParams.get('includeArchived') === '1'

  let query = getSupabaseAdmin().from('coaches').select('*').order('name', { ascending: true })
  if (!includeArchived) query = query.is('archived_at', null)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await requireRole('admin'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  if (!body.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin().from('coaches').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

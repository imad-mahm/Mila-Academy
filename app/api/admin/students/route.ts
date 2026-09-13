import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// ?includeArchived=1 to also return archived students (default: active only)
export async function GET(req: NextRequest) {
  if (!(await requireRole('admin', 'coach'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const includeArchived = req.nextUrl.searchParams.get('includeArchived') === '1'

  let query = getSupabaseAdmin().from('students').select('*').order('name', { ascending: true })
  if (!includeArchived) query = query.is('archived_at', null)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await requireRole('admin', 'coach'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  const { name, academy } = body

  if (!name || !academy) {
    return NextResponse.json({ error: 'name and academy are required' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin().from('students').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabaseAdmin.from('site_settings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const asObject = Object.fromEntries((data ?? []).map(row => [row.key, row.value]))
  return NextResponse.json({ data: asObject })
}

// Body: { [key: string]: string } — upserts each key/value pair given.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await req.json()) as Record<string, string>
  const rows = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }))

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No settings provided' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('site_settings').upsert(rows, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

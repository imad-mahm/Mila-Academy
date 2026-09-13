import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const { category, caption, sort_order } = body

  const { data, error } = await getSupabaseAdmin()
    .from('gallery_photos')
    .update({ category, caption, sort_order })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  const admin = getSupabaseAdmin()
  const { data: existing } = await admin
    .from('gallery_photos')
    .select('storage_path')
    .eq('id', id)
    .single()

  const { error } = await admin.from('gallery_photos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (existing?.storage_path) {
    await admin.storage.from('gallery').remove([existing.storage_path])
  }

  return NextResponse.json({ ok: true })
}

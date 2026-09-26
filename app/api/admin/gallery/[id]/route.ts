import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidateSite } from '@/lib/server/revalidate'
import { readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'

const CATEGORIES = ['football', 'basketball', 'events'] as const

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  // Built field by field. The previous version always wrote all three columns,
  // so a PATCH of just the caption also blanked category and sort_order.
  const values: Record<string, unknown> = {}

  if (body.category !== undefined) {
    if (typeof body.category !== 'string' || !CATEGORIES.includes(body.category as typeof CATEGORIES[number])) {
      return badRequest(`category must be one of: ${CATEGORIES.join(', ')}`)
    }
    values.category = body.category
  }
  if (body.caption !== undefined) values.caption = String(body.caption).slice(0, 300)
  if (body.sort_order !== undefined) {
    const n = Number(body.sort_order)
    if (!Number.isFinite(n)) return badRequest('sort_order must be a number')
    values.sort_order = n
  }

  if (Object.keys(values).length === 0) return badRequest('No updatable fields provided')

  const { data, error } = await getSupabaseAdmin()
    .from('gallery_photos').update(values).eq('id', id).select().maybeSingle()

  if (error) return dbError('gallery.update', error)
  if (!data) return notFound('Photo not found')
  revalidateSite()
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('gallery_photos')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!existing) return notFound('Photo not found')

  const { error } = await admin.from('gallery_photos').delete().eq('id', id)
  if (error) return dbError('gallery.delete', error)

  if (existing.storage_path) {
    await admin.storage.from('gallery').remove([existing.storage_path])
  }

  revalidateSite()
  return NextResponse.json({ ok: true })
}

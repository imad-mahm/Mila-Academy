import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidateSite } from '@/lib/server/revalidate'
import { readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'
import { CONTENT_FIELDS, CONTENT_KEYS, maxLengthFor } from '@/lib/content-schema'

// Site content: every editable text/image on the public site, stored as
// key/value rows in site_settings. The allowed keys and their defaults are
// defined in lib/content-schema.ts.

const FIELD_BY_KEY = new Map(CONTENT_FIELDS.map(f => [f.key, f]))

// GET → { data: { key: savedValue } } — only keys that have been saved. The
// editor fills the rest from the schema defaults it already has.
export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()

  const { data, error } = await getSupabaseAdmin().from('site_settings').select('key, value')
  if (error) return dbError('settings.list', error)

  const saved = Object.fromEntries(
    (data ?? []).filter(row => CONTENT_KEYS.has(row.key)).map(row => [row.key, row.value]),
  )
  return NextResponse.json({ data: saved })
}

// PATCH body: { [key]: string | null }
//   string → save that value ('' is allowed and hides optional items)
//   null   → forget the saved value, so the default shows again
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const unknown = Object.keys(body).filter(k => !CONTENT_KEYS.has(k))
  if (unknown.length > 0) return badRequest(`Unknown field(s): ${unknown.join(', ')}`)

  const upserts: { key: string; value: string }[] = []
  const resets: string[] = []
  for (const [key, raw] of Object.entries(body)) {
    if (raw === null) { resets.push(key); continue }
    const field = FIELD_BY_KEY.get(key)!
    const value = String(raw)
    if (value.length > maxLengthFor(field.type)) return badRequest(`"${field.label}" is too long`)
    if (field.type === 'url' && value && !/^https?:\/\//i.test(value)) {
      return badRequest(`"${field.label}" must start with http:// or https://`)
    }
    if (field.type === 'image' && value && !/^(https?:\/\/|\/)/i.test(value)) {
      return badRequest(`"${field.label}" must be an uploaded image or a web address`)
    }
    if (key === 'whatsapp_number' && value && !/^\d{6,15}$/.test(value)) {
      return badRequest('WhatsApp number must be digits only, including the country code (e.g. 96170123456)')
    }
    upserts.push({ key, value })
  }
  if (upserts.length === 0 && resets.length === 0) return badRequest('No fields provided')

  const admin = getSupabaseAdmin()
  if (upserts.length > 0) {
    const { error } = await admin.from('site_settings').upsert(upserts, { onConflict: 'key' })
    if (error) return dbError('settings.update', error)
  }
  if (resets.length > 0) {
    const { error } = await admin.from('site_settings').delete().in('key', resets)
    if (error) return dbError('settings.reset', error)
  }

  revalidateSite()
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'

// The keys the public site actually reads (see SiteSettings in lib/site-data.ts).
// PATCH used to upsert whatever keys the body contained, so a typo silently
// created a dead row and nothing validated what was being stored.
const SETTING_KEYS = [
  'players_trained', 'years_excellence', 'academies_count', 'success_rate',
  'phone_display', 'whatsapp_number', 'email', 'location', 'hours',
  'instagram_url', 'facebook_url', 'youtube_url',
] as const

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()

  const { data, error } = await getSupabaseAdmin().from('site_settings').select('*')
  if (error) return dbError('settings.list', error)

  const asObject = Object.fromEntries((data ?? []).map(row => [row.key, row.value]))
  return NextResponse.json({ data: asObject })
}

// Body: { [key: string]: string } — upserts each known key/value pair given.
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const unknown = Object.keys(body).filter(
    k => !SETTING_KEYS.includes(k as typeof SETTING_KEYS[number]),
  )
  if (unknown.length > 0) {
    return badRequest(`Unknown setting(s): ${unknown.join(', ')}`)
  }

  const rows = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }))
  if (rows.length === 0) return badRequest('No settings provided')

  const { error } = await getSupabaseAdmin().from('site_settings').upsert(rows, { onConflict: 'key' })
  if (error) return dbError('settings.update', error)

  return NextResponse.json({ ok: true })
}

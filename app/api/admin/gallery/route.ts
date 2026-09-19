import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { dbError, unauthorized } from '@/lib/api-fields'

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()

  const { data, error } = await getSupabaseAdmin()
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return dbError('gallery.list', error)
  return NextResponse.json({ data })
}

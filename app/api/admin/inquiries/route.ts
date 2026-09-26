import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { dbError, unauthorized } from '@/lib/api-fields'

// Enquiry-form submissions from the public Contact section, newest first.
export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()

  const { data, error } = await getSupabaseAdmin()
    .from('enrollment_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return dbError('inquiries.list', error)
  return NextResponse.json({ data })
}

import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { readJson, dbError, badRequest, unauthorized, notFound } from '@/lib/api-fields'

// Mark an enquiry handled / not handled.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const body = await readJson(req)
  if (!body || typeof body.handled !== 'boolean') return badRequest('handled (true/false) is required')

  const { data, error } = await getSupabaseAdmin()
    .from('enrollment_inquiries')
    .update({ handled: body.handled })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) return dbError('inquiries.update', error)
  if (!data) return notFound('Inquiry not found')
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return unauthorized()

  const { id } = await params
  const { error, count } = await getSupabaseAdmin()
    .from('enrollment_inquiries').delete({ count: 'exact' }).eq('id', id)

  if (error) return dbError('inquiries.delete', error)
  if (!count) return notFound('Inquiry not found')
  return NextResponse.json({ ok: true })
}

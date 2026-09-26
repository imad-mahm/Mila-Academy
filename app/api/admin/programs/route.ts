import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidateSite } from '@/lib/server/revalidate'
import { readJson, dbError, badRequest, unauthorized } from '@/lib/api-fields'
import { programValues } from './validate'

// Every program, including inactive ones — the public site filters those out.
export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()

  const { data, error } = await getSupabaseAdmin()
    .from('programs')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return dbError('programs.list', error)
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const body = await readJson(req)
  if (!body) return badRequest('Invalid JSON body')

  const result = programValues(body, false)
  if ('error' in result) return badRequest(result.error)

  const { data, error } = await getSupabaseAdmin()
    .from('programs')
    .insert(result.values)
    .select()
    .single()

  if (error) return dbError('programs.create', error)
  revalidateSite()
  return NextResponse.json({ data }, { status: 201 })
}

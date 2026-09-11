import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  const category = form.get('category') as string | null
  const caption = (form.get('caption') as string | null) ?? ''
  const sortOrder = Number(form.get('sort_order') ?? 0)

  if (!file || !category) {
    return NextResponse.json({ error: 'file and category are required' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${category}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('gallery')
    .upload(path, file, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('gallery').getPublicUrl(path)

  const { data, error } = await supabaseAdmin
    .from('gallery_photos')
    .insert({
      image_url: urlData.publicUrl,
      category,
      caption,
      sort_order: sortOrder,
      storage_path: path,
    })
    .select()
    .single()

  if (error) {
    // Roll back the uploaded file if the DB insert failed
    await supabaseAdmin.storage.from('gallery').remove([path])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

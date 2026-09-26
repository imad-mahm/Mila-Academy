import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { dbError, badRequest, unauthorized } from '@/lib/api-fields'

// Uploads an image to the public `site-assets` bucket and returns its URL.
// Used by the Site Content editor (logos, banners, tab icon) and the Programs
// editor (card photos). The URL is then saved by whichever form asked for it.

// The extension comes from the validated content type, never the uploaded
// filename, which is caller-controlled and can carry path separators.
const EXT_BY_TYPE: Record<string, string> = {
  'image/png':     'png',
  'image/jpeg':    'jpg',
  'image/webp':    'webp',
  'image/gif':     'gif',
  'image/svg+xml': 'svg',
}

const FOLDERS = ['content', 'programs'] as const
const MAX_SIZE = 5 * 1024 * 1024 // 5MB, matches the bucket limit

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return badRequest('Expected multipart/form-data')
  }

  const file = form.get('file')
  const folder = form.get('folder') ?? 'content'
  if (!(file instanceof File)) return badRequest('file is required')
  if (typeof folder !== 'string' || !FOLDERS.includes(folder as typeof FOLDERS[number])) {
    return badRequest('Invalid folder')
  }

  const ext = EXT_BY_TYPE[file.type]
  if (!ext) return badRequest('Unsupported file type — use PNG, JPG, WEBP, GIF or SVG')
  if (file.size === 0) return badRequest('File is empty')
  if (file.size > MAX_SIZE) return badRequest('File too large (max 5MB)')

  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const admin = getSupabaseAdmin()
  const { error } = await admin.storage
    .from('site-assets')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) return dbError('assets.upload', error)

  const { data } = admin.storage.from('site-assets').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl }, { status: 201 })
}

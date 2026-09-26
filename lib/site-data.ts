import { cache } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { CONTENT_DEFAULTS, CONTENT_KEYS, type SiteContent } from '@/lib/content-schema'
import type { Academy, Program } from '@/lib/programs'

export type { Program } from '@/lib/programs'
export type { SiteContent } from '@/lib/content-schema'

export type Testimonial = {
  id: string
  quote: string
  name: string
  initials: string
  role: string
  rating: number
}

export type GalleryPhoto = {
  id: string
  image_url: string
  category: 'football' | 'basketball' | 'events'
  caption: string
}

// Without credentials every call below would fire a request at the placeholder
// URL in lib/supabase.ts and fail with a bare "TypeError: fetch failed" — four
// of them per page load, which is what fills the dev overlay's issue counter.
// Warn once, clearly, and skip the doomed round-trips.
let warnedUnconfigured = false

function unconfigured(): boolean {
  if (isSupabaseConfigured) return false
  if (!warnedUnconfigured) {
    warnedUnconfigured = true
    console.warn(
      '[site-data] Supabase is not configured — the public site will render ' +
      'with empty programmes/testimonials/gallery and default text. Copy ' +
      '.env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
  return true
}

// A dead or mistyped project URL fails at the network layer, and supabase-js
// surfaces that as the bare string "TypeError: fetch failed" — four times a
// page load, naming neither the host nor the cause. Say what actually happened.
let warnedUnreachable = false

function reportError(label: string, message: string): void {
  const isNetwork = /fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(message)
  if (!isNetwork) {
    console.error(`[site-data] ${label}: ${message}`)
    return
  }
  if (warnedUnreachable) return
  warnedUnreachable = true
  console.error(
    `[site-data] Cannot reach Supabase at ${process.env.NEXT_PUBLIC_SUPABASE_URL} ` +
    `(${label} failed to connect). The host did not resolve or refused the ` +
    `connection — check NEXT_PUBLIC_SUPABASE_URL in .env.local matches the ` +
    `Project URL shown in your Supabase dashboard, and that the project is ` +
    `still active. The site will render without database content.`
  )
}

// supabase-js retries failed reads three times with 1s/2s/4s backoff. For a
// public page that is seven seconds of blank screen whenever the database is
// unreachable, so these reads fail fast and fall back to defaults instead.
const PROGRAM_COLUMNS =
  'id, sport, name, subtitle, age_min, age_max, level, gender, price_month, sessions_per_week, image_url, featured, active, sort_order'

/** Active programs, optionally for one sport, in display order. */
export async function getPrograms(sport?: Academy): Promise<Program[]> {
  if (unconfigured()) return []
  let q = supabase.from('programs').select(PROGRAM_COLUMNS).eq('active', true)
  if (sport) q = q.eq('sport', sport)
  const { data, error } = await q.order('sort_order', { ascending: true }).retry(false)
  if (error) { reportError('getPrograms', error.message); return [] }
  return (data ?? []) as Program[]
}

/** The programs picked for the homepage "Our Programs" section. */
export async function getFeaturedPrograms(): Promise<Program[]> {
  return (await getPrograms()).filter(p => p.featured)
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (unconfigured()) return []
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, quote, name, initials, role, rating')
    .order('sort_order', { ascending: true })
    .retry(false)
  if (error) { reportError('getTestimonials', error.message); return [] }
  return data ?? []
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (unconfigured()) return []
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('id, image_url, category, caption')
    .order('sort_order', { ascending: true })
    .retry(false)
  if (error) { reportError('getGalleryPhotos', error.message); return [] }
  return data ?? []
}

/**
 * Every editable text/image on the site: what the admin saved, with the
 * schema default for anything they haven't. Unknown keys in the table are
 * ignored. Memoised per request — metadata and the page body both need it.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (unconfigured()) return { ...CONTENT_DEFAULTS }
  const { data, error } = await supabase.from('site_settings').select('key, value').retry(false)
  if (error) { reportError('getSiteContent', error.message); return { ...CONTENT_DEFAULTS } }
  const saved = Object.fromEntries(
    (data ?? []).filter(r => CONTENT_KEYS.has(r.key)).map(r => [r.key, r.value]),
  )
  return { ...CONTENT_DEFAULTS, ...saved }
})

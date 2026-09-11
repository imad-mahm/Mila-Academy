import { supabase } from '@/lib/supabase'

export type Program = {
  id: string
  sport: 'football' | 'basketball'
  name: string
  subtitle: string
  age_range: string
  frequency: string
  price_month: number
}

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

export type SiteSettings = {
  players_trained: string
  years_excellence: string
  academies_count: string
  success_rate: string
  phone_display: string
  whatsapp_number: string
  email: string
  location: string
  hours: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
}

const FALLBACK_SETTINGS: SiteSettings = {
  players_trained: '0', years_excellence: '0', academies_count: '0', success_rate: '0%',
  phone_display: '', whatsapp_number: '', email: '', location: '', hours: '',
  instagram_url: '#', facebook_url: '#', youtube_url: '#',
}

export async function getPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('id, sport, name, subtitle, age_range, frequency, price_month')
    .order('sort_order', { ascending: true })
  if (error) { console.error('getPrograms:', error.message); return [] }
  return data ?? []
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, quote, name, initials, role, rating')
    .order('sort_order', { ascending: true })
  if (error) { console.error('getTestimonials:', error.message); return [] }
  return data ?? []
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('id, image_url, category, caption')
    .order('sort_order', { ascending: true })
  if (error) { console.error('getGalleryPhotos:', error.message); return [] }
  return data ?? []
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) { console.error('getSiteSettings:', error.message); return FALLBACK_SETTINGS }
  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
  return { ...FALLBACK_SETTINGS, ...map }
}

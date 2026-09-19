import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// .env.local starts life as a copy of .env.example, whose values are
// placeholders ("https://your-project-ref.supabase.co", "sb_publishable_xxx…").
// Those parse as a perfectly valid https URL, so a naive check treats them as
// configured and every query then fails against a host that doesn't exist —
// surfacing as a bare "TypeError: fetch failed" with no hint at the cause.
// Matched precisely (a run of x's, or the example's own hostname) rather than
// by loose substring, so a real key that happens to contain "xxxxxxxx" isn't
// mistaken for a placeholder.
function isPlaceholder(value: string): boolean {
  return (
    value.includes('your-project-ref') ||
    value.includes('your_supabase') ||
    /^sb_(publishable|secret)_x+$/.test(value) ||
    /^https:\/\/placeholder\./.test(value)
  )
}

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  /^https?:\/\//.test(supabaseUrl) &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey)

// Fall back to a dummy URL so the app still boots when unconfigured — callers
// check `isSupabaseConfigured` and skip the request entirely.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl! : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key',
  {
    // The public site never signs anyone in — it reads public content and
    // inserts enrolment enquiries. Without this the client registers a GoTrue
    // auth session per instance and logs "Multiple GoTrueClient instances
    // detected in the same browser context" whenever the module is evaluated
    // more than once (HMR, or both a server and client import).
    auth: { persistSession: false, autoRefreshToken: false },
  }
)

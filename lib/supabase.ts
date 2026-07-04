import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// .env.local currently ships with placeholder values ("your_supabase_url"),
// which crashes createClient() at import time and takes down any page that
// imports this module. Fall back to a dummy URL so the app boots; real calls
// will just fail cleanly (network error) until real credentials are set.
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && /^https?:\/\//.test(supabaseUrl)

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl! : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key'
)

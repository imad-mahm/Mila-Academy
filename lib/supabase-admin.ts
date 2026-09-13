import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Created on first use, not at import time: Next collects page data for every
// route handler at build time, and a module that throws on import fails the
// whole build on any machine without the secrets (CI, a fresh clone).
let client: SupabaseClient | null = null

/**
 * Server-only Supabase client using the secret key — bypasses RLS.
 * The `server-only` import makes bundling this into a client component a
 * build-time error, not just a convention to remember.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) {
    throw new Error(
      'Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local'
    )
  }

  client = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return client
}

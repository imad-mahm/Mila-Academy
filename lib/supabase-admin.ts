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

  // The placeholder check matters as much as the missing-value one: a fresh
  // .env.local copied from .env.example has syntactically valid values, so
  // without this every admin request fails later as an opaque 500 instead of
  // saying the credentials were never filled in.
  const isPlaceholder = (v: string) =>
    v.includes('your-project-ref') ||
    v.includes('your_supabase') ||
    /^sb_(publishable|secret)_x+$/.test(v)

  if (!url || !secretKey || isPlaceholder(url) || isPlaceholder(secretKey)) {
    throw new Error(
      'Supabase admin client is not configured. Set real values for ' +
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local ' +
      '(the .env.example placeholders are not usable).'
    )
  }

  client = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return client
}

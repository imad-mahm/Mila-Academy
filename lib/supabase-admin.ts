import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Server-only client using the secret key — bypasses RLS entirely.
// The `server-only` import makes bundling this into a client component a
// build-time error, not just a convention to remember.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

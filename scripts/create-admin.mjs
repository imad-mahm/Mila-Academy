// Create the first admin account — or recover access if every admin is locked
// out. Everything after that is done from the dashboard (Admin → Users).
//
//   npm run create-admin -- <email> "<name>" <password>
//
// If the email already exists, that account is made an enabled admin with the
// given password (and signed out everywhere). Reads the Supabase credentials
// from .env.local, like the app does.

import { readFileSync } from 'node:fs'
import { scrypt, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const [email, name, password] = process.argv.slice(2)
if (!email || !name || !password) {
  console.error('Usage: npm run create-admin -- <email> "<name>" <password>')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

function loadEnv() {
  try {
    for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // no .env.local — fall back to the real environment
  }
}
loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local')
  process.exit(1)
}

// Same format as lib/server/passwords.ts — keep the two in step.
function hashPassword(pw) {
  const N = 16384, r = 8, p = 1
  const salt = randomBytes(16)
  return new Promise((resolve, reject) => {
    scrypt(pw, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, hash) => {
      if (err) reject(err)
      else resolve(`scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`)
    })
  })
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const normalized = email.trim().toLowerCase()
const password_hash = await hashPassword(password)

const { data: existing, error: findError } = await db
  .from('app_users').select('id, session_version').ilike('email', normalized).maybeSingle()
if (findError) {
  console.error('Could not read app_users:', findError.message)
  console.error('Has supabase/migration_admin_cms.sql been run in the Supabase SQL Editor?')
  process.exit(1)
}

const row = {
  email: normalized, name, role: 'admin', academies: ['MFA', 'MBA'],
  team_id: null, student_id: null, disabled: false, must_change_password: false, password_hash,
}

const { error } = existing
  ? await db.from('app_users')
      .update({ ...row, session_version: existing.session_version + 1, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  : await db.from('app_users').insert(row)

if (error) {
  console.error('Failed:', error.message)
  process.exit(1)
}
console.log(existing
  ? `Updated ${normalized}: now an enabled admin with the new password.`
  : `Created admin ${normalized}. Sign in at /dashboard/login.`)

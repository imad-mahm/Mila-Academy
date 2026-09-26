import 'server-only'
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'

// scrypt from Node's standard library — no native bcrypt build step, and the
// parameters are stored alongside each hash so they can be raised later
// without invalidating existing passwords.
//
// Stored format:  scrypt$<N>$<r>$<p>$<salt b64>$<hash b64>
// scripts/create-admin.mjs writes the same format; keep the two in step.

const N = 16384
const R = 8
const P = 1
const KEYLEN = 64

export const MIN_PASSWORD_LENGTH = 8

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await derive(password, salt, N, R, P)
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, n, r, p, saltB64, hashB64] = parts
  const expected = Buffer.from(hashB64, 'base64')
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), Number(n), Number(r), Number(p))
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// A real hash of a random string. Login verifies against it when the email is
// unknown, so "no such user" takes as long as "wrong password" and response
// timing doesn't reveal which emails have accounts.
let dummyHash: Promise<string> | null = null
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(12).toString('hex'))
  return dummyHash
}

/** A problem with a proposed password, or null if it's acceptable. */
export function passwordProblem(password: unknown): string | null {
  if (typeof password !== 'string') return 'Password is required'
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  if (password.length > 200) return 'Password is too long'
  return null
}

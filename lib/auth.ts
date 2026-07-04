// ── Types ──────────────────────────────────────────────────────────────────────

export type Academy       = 'MFA' | 'MBA'
export type AcademyFilter = 'MFA' | 'MBA' | 'Both'
export type Role          = 'admin' | 'coach' | 'parent' | 'student'
export type Resource      = 'students' | 'attendance' | 'matches' | 'coaches' | 'payments' | 'ratings' | 'reports' | 'settings'
export type Action        = 'view' | 'edit' | 'create' | 'delete'

export interface MilaUser {
  id: string
  email: string
  password: string
  role: Role
  name: string
  academies: Academy[]
  teamId?: string | null
  studentId?: string
}

/** Shape stored in localStorage mila_user (no password) */
export interface SessionUser {
  id: string
  email: string
  role: Role
  name: string
  academies: Academy[]
  teamId?: string | null
  studentId?: string
  selectedAcademy: AcademyFilter
  loggedIn: true
}

// ── Keys ───────────────────────────────────────────────────────────────────────

const USERS_KEY   = 'mila_users'
const SESSION_KEY = 'mila_user'
const COOKIE_NAME = 'mila_session'
const COOKIE_DAYS = 7

// ── Seed data ─────────────────────────────────────────────────────────────────
// studentIds reference actual student IDs from app/dashboard/students/data.ts:
//   '6' → Ali Hassan   (mfa-u14)
//   '9' → Nour Saleh   (mba-u16)
//   '2' → Omar Khalil  (mfa-u17)

const SEED_USERS: MilaUser[] = [
  {
    id: 'admin-1',
    email: 'admin@milaacademy.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    academies: ['MFA', 'MBA'],
  },
  {
    id: 'coach-mfa-1',
    email: 'coach.mfa@milaacademy.com',
    password: 'coach123',
    role: 'coach',
    name: 'Coach Ahmad',
    academies: ['MFA'],
    teamId: 'mfa-u14',
  },
  {
    id: 'coach-mba-1',
    email: 'coach.mba@milaacademy.com',
    password: 'coach123',
    role: 'coach',
    name: 'Coach Karim',
    academies: ['MBA'],
    teamId: 'mba-u16',
  },
  {
    id: 'coach-both-1',
    email: 'coach.both@milaacademy.com',
    password: 'coach123',
    role: 'coach',
    name: 'Coach Samir',
    academies: ['MFA', 'MBA'],
    teamId: null,
  },
  {
    id: 'parent-1',
    email: 'parent1@gmail.com',
    password: 'parent123',
    role: 'parent',
    name: 'Mr. Hassan',
    academies: ['MFA'],
    studentId: '6',
  },
  {
    id: 'parent-2',
    email: 'parent2@gmail.com',
    password: 'parent123',
    role: 'parent',
    name: 'Mrs. Nour',
    academies: ['MBA'],
    studentId: '9',
  },
  {
    id: 'student-001',
    email: 'student1@mila.com',
    password: 'student123',
    role: 'student',
    name: 'Ali Hassan',
    academies: ['MFA'],
    studentId: '6',
  },
  {
    id: 'student-002',
    email: 'student2@mila.com',
    password: 'student123',
    role: 'student',
    name: 'Maya Nour',
    academies: ['MBA'],
    studentId: '9',
  },
  {
    id: 'student-003',
    email: 'student3@mila.com',
    password: 'student123',
    role: 'student',
    name: 'Omar Saad',
    academies: ['MFA', 'MBA'],
    studentId: '2',
  },
]

// ── Internal helpers ───────────────────────────────────────────────────────────

function getUsers(): MilaUser[] {
  if (typeof window === 'undefined') return SEED_USERS
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as MilaUser[]) : SEED_USERS
  } catch {
    return SEED_USERS
  }
}

function defaultAcademy(u: MilaUser): AcademyFilter {
  if (u.academies.includes('MFA') && u.academies.includes('MBA')) return 'Both'
  return u.academies[0] ?? 'MFA'
}

function writeCookie(value: string): void {
  if (typeof document === 'undefined') return
  const maxAge = COOKIE_DAYS * 24 * 60 * 60
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function clearCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Seed default users into localStorage if the store is empty. Call on app init. */
export function seedUsers(): void {
  if (typeof window === 'undefined') return
  try {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS))
    }
  } catch {}
}

/**
 * Validate credentials and create a session.
 * Returns the session user on success, or null on failure.
 */
export function login(email: string, password: string): SessionUser | null {
  const users = getUsers()
  const user  = users.find(
    u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  )
  if (!user) return null

  const { password: _pw, ...rest } = user
  const session: SessionUser = {
    ...rest,
    selectedAcademy: defaultAcademy(user),
    loggedIn: true,
  }

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    // Minimal cookie payload for middleware — role lets us skip unnecessary DB calls later
    writeCookie(encodeURIComponent(JSON.stringify({ id: session.id, role: session.role })))
  } catch {}

  return session
}

/** Clear session from localStorage and cookie. */
export function logout(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
    clearCookie()
  } catch {}
}

/** Read the current session from localStorage. Returns null if not logged in. */
export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

/** Persist the selected academy filter without requiring a full re-login. */
export function setSelectedAcademy(filter: AcademyFilter): void {
  const user = getCurrentUser()
  if (!user) return
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, selectedAcademy: filter }))
  } catch {}
}

/**
 * Return whether the given user may perform `action` on `resource`.
 * admin always returns true.
 */
export function hasAccess(resource: Resource, action: Action, user: SessionUser): boolean {
  switch (user.role) {
    case 'admin':
      return true

    case 'coach':
      // Coaches cannot see financial data or global settings
      if (resource === 'payments') return false
      if (resource === 'settings') return false
      // Coaches can view & manage everything else for their teams
      return true

    case 'parent':
      // Parents get read-only access to their child's data only
      if (resource === 'students')   return action === 'view'
      if (resource === 'attendance') return action === 'view'
      if (resource === 'ratings')    return action === 'view'
      if (resource === 'matches')    return action === 'view'
      if (resource === 'payments')   return action === 'view'
      return false

    case 'student':
      // Students get read-only access to their own profile areas, no payments
      if (resource === 'students')   return action === 'view'
      if (resource === 'attendance') return action === 'view'
      if (resource === 'ratings')    return action === 'view'
      if (resource === 'matches')    return action === 'view'
      return false

    default:
      return false
  }
}

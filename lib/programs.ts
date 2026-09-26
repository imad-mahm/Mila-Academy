// Program model shared by the homepage cards, the /football and /basketball
// explorers, and the dashboard's Programs editor. The catalog itself lives in
// the `programs` table (see supabase/migration_admin_cms.sql); academy names,
// taglines and logos are editable content (lib/content-schema.ts).

export type Academy = 'football' | 'basketball'
export type Level = 'Beginner' | 'Intermediate' | 'Elite' | 'Pro'
export type Gender = 'Boys' | 'Girls' | 'Mixed'

export const LEVELS: readonly Level[] = ['Beginner', 'Intermediate', 'Elite', 'Pro']
export const GENDERS: readonly Gender[] = ['Boys', 'Girls', 'Mixed']
export const SPORTS: readonly Academy[] = ['football', 'basketball']

export interface Program {
  id: string
  sport: Academy
  name: string // e.g. "U12 Boys"
  subtitle: string // e.g. "Rising Stars"
  age_min: number
  age_max: number // 50 or more means "and up" (rendered as "Ages 17+")
  level: Level
  gender: Gender
  price_month: number
  sessions_per_week: number
  image_url: string
  /** Shown in the homepage "Our Programs" section. */
  featured: boolean
  /** Hidden from the public site when false. */
  active: boolean
  sort_order: number
}

// Rank used when sorting by level (Beginner is "lowest").
export const LEVEL_ORDER: Record<Level, number> = {
  Beginner: 0,
  Intermediate: 1,
  Elite: 2,
  Pro: 3,
}

// ── Display helpers (keep all formatting in one place) ──────────────────────────
export const ageLabel = (p: Pick<Program, 'age_min' | 'age_max'>) =>
  p.age_max >= 50 ? `Ages ${p.age_min}+` : `Ages ${p.age_min}–${p.age_max}`
export const priceLabel = (p: Pick<Program, 'price_month'>) => `$${p.price_month} / month`
export const sessionsLabel = (p: Pick<Program, 'sessions_per_week'>) => `${p.sessions_per_week}× / week`

// ── Per-academy styling (colours are part of the design system, not content) ───
export const ACADEMY_STYLE: Record<Academy, { accent: string; accentRgb: string }> = {
  football:   { accent: 'var(--color-football)',   accentRgb: 'var(--color-football-rgb)'   },
  basketball: { accent: 'var(--color-basketball)', accentRgb: 'var(--color-basketball-rgb)' },
}

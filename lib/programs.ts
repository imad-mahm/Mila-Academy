// PLACEHOLDER DATA — the program catalog below is illustrative (invented teams,
// ages, and prices) so the /football and /basketball pages have something real to
// sort and filter. Replace with the actual team list before launch.
//
// Single source of truth for academy program data + per-academy display metadata.
// Consumed by app/components/ProgramsExplorer.tsx and app/components/AcademyLanding.tsx.

export type Academy = 'football' | 'basketball'
export type Level = 'Beginner' | 'Intermediate' | 'Elite' | 'Pro'
export type Gender = 'Boys' | 'Girls' | 'Mixed'

export interface Program {
  id: string
  academy: Academy
  name: string // e.g. "U12 Boys"
  subtitle: string // e.g. "Rising Stars"
  ageMin: number
  ageMax: number // use 99 to mean "and up" (rendered as "Ages 17+")
  level: Level
  gender: Gender
  priceMonthly: number // e.g. 70
  sessionsPerWeek: number // e.g. 3
  imageSeed: number // deterministic picsum seed so each card gets a stable photo
}

// Rank used when sorting by level (Beginner is "lowest").
export const LEVEL_ORDER: Record<Level, number> = {
  Beginner: 0,
  Intermediate: 1,
  Elite: 2,
  Pro: 3,
}

// ── Display helpers (keep all formatting in one place) ──────────────────────────
export const ageLabel = (p: Program) =>
  p.ageMax >= 50 ? `Ages ${p.ageMin}+` : `Ages ${p.ageMin}–${p.ageMax}`
export const priceLabel = (p: Program) => `$${p.priceMonthly} / month`
export const sessionsLabel = (p: Program) => `${p.sessionsPerWeek}× / week`

// ── Per-academy metadata (branding + hero assets) ───────────────────────────────
export const ACADEMY_META: Record<
  Academy,
  {
    name: string
    short: string
    tagline: string
    est: string
    accent: string
    accentRgb: string
    logo: string
    hero: string
    icon: Academy
  }
> = {
  football: {
    name: 'Mila Football Academy',
    short: 'MFA',
    tagline: 'Where Champions Are Made',
    est: 'Est. 2016 · Lebanon',
    accent: 'var(--color-football)',
    accentRgb: 'var(--color-football-rgb)',
    logo: '/logos/mfa_navbar.png',
    hero: '/logos/mfa_hero.png',
    icon: 'football',
  },
  basketball: {
    name: 'Mila Basket Academy',
    short: 'MBA',
    tagline: 'Rise Above the Rest',
    est: 'Est. 2024 · Baissour',
    accent: 'var(--color-basketball)',
    accentRgb: 'var(--color-basketball-rgb)',
    logo: '/logos/mba_navbar.png',
    hero: '/logos/mba_hero.png',
    icon: 'basketball',
  },
}

// ── The catalog ─────────────────────────────────────────────────────────────────
export const PROGRAMS: Program[] = [
  // Football
  { id: 'fb-u6-mixed',   academy: 'football', name: 'U6 Mixed',    subtitle: 'Little Kickers',  ageMin: 4,  ageMax: 6,  level: 'Beginner',     gender: 'Mixed', priceMonthly: 40,  sessionsPerWeek: 2, imageSeed: 101 },
  { id: 'fb-u8-boys',    academy: 'football', name: 'U8 Boys',     subtitle: 'Little Champions',ageMin: 6,  ageMax: 8,  level: 'Beginner',     gender: 'Boys',  priceMonthly: 50,  sessionsPerWeek: 2, imageSeed: 102 },
  { id: 'fb-u8-girls',   academy: 'football', name: 'U8 Girls',    subtitle: 'Little Stars',    ageMin: 6,  ageMax: 8,  level: 'Beginner',     gender: 'Girls', priceMonthly: 50,  sessionsPerWeek: 2, imageSeed: 103 },
  { id: 'fb-u10-boys',   academy: 'football', name: 'U10 Boys',    subtitle: 'Junior Eagles',   ageMin: 8,  ageMax: 10, level: 'Beginner',     gender: 'Boys',  priceMonthly: 60,  sessionsPerWeek: 2, imageSeed: 104 },
  { id: 'fb-u12-boys',   academy: 'football', name: 'U12 Boys',    subtitle: 'Rising Stars',    ageMin: 9,  ageMax: 12, level: 'Intermediate', gender: 'Boys',  priceMonthly: 70,  sessionsPerWeek: 3, imageSeed: 105 },
  { id: 'fb-u12-girls',  academy: 'football', name: 'U12 Girls',   subtitle: 'Rising Stars',    ageMin: 9,  ageMax: 12, level: 'Intermediate', gender: 'Girls', priceMonthly: 70,  sessionsPerWeek: 3, imageSeed: 106 },
  { id: 'fb-u14-boys',   academy: 'football', name: 'U14 Boys',    subtitle: 'Young Guns',      ageMin: 12, ageMax: 14, level: 'Intermediate', gender: 'Boys',  priceMonthly: 80,  sessionsPerWeek: 3, imageSeed: 107 },
  { id: 'fb-u16-boys',   academy: 'football', name: 'U16 Boys',    subtitle: 'Elite Youth',     ageMin: 13, ageMax: 16, level: 'Elite',        gender: 'Boys',  priceMonthly: 90,  sessionsPerWeek: 4, imageSeed: 108 },
  { id: 'fb-u16-girls',  academy: 'football', name: 'U16 Girls',   subtitle: 'Elite Youth',     ageMin: 13, ageMax: 16, level: 'Elite',        gender: 'Girls', priceMonthly: 90,  sessionsPerWeek: 4, imageSeed: 109 },
  { id: 'fb-u18-boys',   academy: 'football', name: 'U18 Boys',    subtitle: 'Academy Elite',   ageMin: 16, ageMax: 18, level: 'Elite',        gender: 'Boys',  priceMonthly: 100, sessionsPerWeek: 4, imageSeed: 110 },
  { id: 'fb-adult',      academy: 'football', name: 'Adult Squad', subtitle: 'Pro Level',       ageMin: 17, ageMax: 99, level: 'Pro',          gender: 'Mixed', priceMonthly: 110, sessionsPerWeek: 5, imageSeed: 111 },

  // Basketball
  { id: 'bb-u8-mixed',   academy: 'basketball', name: 'U8 Mixed',     subtitle: 'Mini Ballers',  ageMin: 6,  ageMax: 8,  level: 'Beginner',     gender: 'Mixed', priceMonthly: 50, sessionsPerWeek: 2, imageSeed: 201 },
  { id: 'bb-u10-mixed',  academy: 'basketball', name: 'U10 Mixed',    subtitle: 'Court Kids',    ageMin: 8,  ageMax: 10, level: 'Beginner',     gender: 'Mixed', priceMonthly: 55, sessionsPerWeek: 2, imageSeed: 202 },
  { id: 'bb-u12-boys',   academy: 'basketball', name: 'U12 Boys',     subtitle: 'Junior Hoops',  ageMin: 10, ageMax: 12, level: 'Beginner',     gender: 'Boys',  priceMonthly: 60, sessionsPerWeek: 2, imageSeed: 203 },
  { id: 'bb-u12-girls',  academy: 'basketball', name: 'U12 Girls',    subtitle: 'Junior Hoops',  ageMin: 10, ageMax: 12, level: 'Beginner',     gender: 'Girls', priceMonthly: 60, sessionsPerWeek: 2, imageSeed: 204 },
  { id: 'bb-u14-boys',   academy: 'basketball', name: 'U14 Boys',     subtitle: 'Court Kings',   ageMin: 11, ageMax: 14, level: 'Intermediate', gender: 'Boys',  priceMonthly: 65, sessionsPerWeek: 3, imageSeed: 205 },
  { id: 'bb-u14-girls',  academy: 'basketball', name: 'U14 Girls',    subtitle: 'Court Queens',  ageMin: 11, ageMax: 14, level: 'Intermediate', gender: 'Girls', priceMonthly: 65, sessionsPerWeek: 3, imageSeed: 206 },
  { id: 'bb-u16-boys',   academy: 'basketball', name: 'U16 Boys',     subtitle: 'Slam Academy',  ageMin: 14, ageMax: 16, level: 'Elite',        gender: 'Boys',  priceMonthly: 75, sessionsPerWeek: 3, imageSeed: 207 },
  { id: 'bb-u18-boys',   academy: 'basketball', name: 'U18 Boys',     subtitle: 'Elite Hoops',   ageMin: 15, ageMax: 18, level: 'Elite',        gender: 'Boys',  priceMonthly: 80, sessionsPerWeek: 4, imageSeed: 208 },
  { id: 'bb-u18-girls',  academy: 'basketball', name: 'U18 Girls',    subtitle: 'Elite Hoops',   ageMin: 15, ageMax: 18, level: 'Elite',        gender: 'Girls', priceMonthly: 80, sessionsPerWeek: 4, imageSeed: 209 },
  { id: 'bb-adult',      academy: 'basketball', name: 'Adult League', subtitle: 'Hoop Masters',  ageMin: 18, ageMax: 99, level: 'Pro',          gender: 'Mixed', priceMonthly: 85, sessionsPerWeek: 4, imageSeed: 210 },
]

// Programs for a given academy (unsorted; ProgramsExplorer handles sort/filter).
export const programsFor = (academy: Academy) =>
  PROGRAMS.filter((p) => p.academy === academy)

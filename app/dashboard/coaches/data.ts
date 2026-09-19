'use client'
import { useSyncExternalStore } from 'react'

// Shared coach data + loader.
//
// The sidebar's global search used to keep its own hardcoded copy of the four
// coach names, so any coach added through the Coaches page was invisible to
// search. Both now read from here.

export interface CoachRow {
  id: string
  name: string
  session_name: string  // matches attendance records e.g. 'Coach Nader'
  specialty: string
  teams: string[]
  experience: number
  bio: string
  phone: string
  email: string
  nationality: string
  certifications: string[]
  languages: string[]
  joined: string
  salary: string
  contract_end: string
  added?: boolean
}

export const BASE_COACHES: CoachRow[] = [
  {
    id: 'coach-1', name: 'Ahmad Nader', session_name: 'Coach Nader',
    specialty: 'Attack & Finishing', teams: ['mfa-u17'], experience: 8,
    bio: 'Former professional midfielder in the Lebanese Premier League. Joined Mila in 2019. Known for high-intensity attack drills and exceptional finishing technique training.',
    phone: '+961 70 100 200', email: 'ahmad.nader@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['UEFA B License', 'LFF Level 2 Coaching Certificate'],
    languages: ['Arabic', 'French', 'English'],
    joined: '2019-09-01', salary: '$1,400/month', contract_end: '2027-06-30',
  },
  {
    id: 'coach-2', name: 'Bilal Akar', session_name: 'Coach Bilal',
    specialty: 'Youth Development', teams: ['mfa-u14'], experience: 5,
    bio: 'Specialist in youth football development with a degree in Sports Science from LAU. Focuses on building fundamental skills and tactical awareness in younger age groups.',
    phone: '+961 76 200 300', email: 'bilal.akar@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['LFF Level 1 Coaching Certificate', 'FIFA Grassroots Certificate'],
    languages: ['Arabic', 'English'],
    joined: '2021-01-15', salary: '$1,100/month', contract_end: '2026-12-31',
  },
  {
    id: 'coach-3', name: 'Samer Khalil', session_name: 'Coach Samer',
    specialty: 'Basketball — Guard Play', teams: ['mba-u16'], experience: 3,
    bio: 'Former FIBA referee turned coach. Deep knowledge of basketball rules and mechanics. Specialises in guard play, dribbling circuits, and team coordination.',
    phone: '+961 70 300 400', email: 'samer.khalil@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['FIBA Level 1 Coach', 'Lebanese Basketball Federation Certificate'],
    languages: ['Arabic', 'English', 'Spanish'],
    joined: '2023-09-01', salary: '$1,000/month', contract_end: '2026-08-31',
  },
  {
    id: 'coach-4', name: 'Nadia Frem', session_name: 'Coach Nadia',
    specialty: 'Fitness & Conditioning', teams: ['mfa-u17', 'mfa-u14'], experience: 6,
    bio: 'Certified sports physiotherapist and strength coach. Works with all MFA teams on conditioning, injury prevention, and athletic performance optimisation.',
    phone: '+961 71 400 500', email: 'nadia.frem@milaacademy.com',
    nationality: 'Lebanese',
    certifications: ['NSCA Certified Strength Coach', 'Sports Physiotherapy Certificate'],
    languages: ['Arabic', 'French'],
    joined: '2020-03-01', salary: '$1,200/month', contract_end: '2027-03-31',
  },
]

const ADDED_KEY = 'mila_coaches_added'

/** Coaches added through the UI, persisted in localStorage. */
export function loadAddedCoaches(): CoachRow[] {
  if (typeof window === 'undefined') return []
  try {
    const added = JSON.parse(localStorage.getItem(ADDED_KEY) ?? '[]')
    return Array.isArray(added) ? (added as CoachRow[]) : []
  } catch {
    return []
  }
}

/** The seeded coaches plus anything staff have added. */
export function loadAllCoaches(): CoachRow[] {
  const added = loadAddedCoaches()
  return added.length ? [...BASE_COACHES, ...added] : BASE_COACHES
}

export function saveAddedCoaches(all: CoachRow[]): void {
  try {
    localStorage.setItem(ADDED_KEY, JSON.stringify(all.filter(c => c.added)))
  } catch {}
}

// ── Reactive access ───────────────────────────────────────────────────────────
// Exposed as an external store so components don't copy the localStorage list
// into their own state inside an effect (which renders once without the added
// coaches, and mismatches the server render).

const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedAll: CoachRow[] = BASE_COACHES

function getSnapshot(): CoachRow[] {
  let raw: string | null = null
  try { raw = localStorage.getItem(ADDED_KEY) } catch {}
  // Cache by the raw string so the snapshot reference stays stable between
  // writes — useSyncExternalStore loops forever on a fresh array each call.
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedAll = loadAllCoaches()
  }
  return cachedAll
}

function getServerSnapshot(): CoachRow[] {
  return BASE_COACHES
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}

/** Seeded coaches plus staff additions, kept in sync across components. */
export function useAllCoaches(): CoachRow[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Persist an added coach and notify every subscriber. */
export function addCoach(coach: CoachRow): void {
  saveAddedCoaches([...loadAllCoaches(), coach])
  cachedRaw = null
  listeners.forEach(l => l())
}

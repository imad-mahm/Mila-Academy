'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  IconHome, IconUsers, IconCalendarCheck, IconTrophy, IconClipboardList,
  IconCash, IconStar, IconChartBar, IconSettings, IconLogout,
  IconSearch, IconX, IconBuildingArch, IconMenu2, IconSun, IconMoon,
  IconListDetails, IconQuote, IconPhoto,
} from '@tabler/icons-react'
import { ToastContainer } from './components/ToastContainer'
import { loadAllStudents } from './students/data'
import {
  getCurrentUser, logout, seedUsers, setSelectedAcademy,
  type SessionUser, type AcademyFilter,
} from '@/lib/auth'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SearchResult {
  label: string; sub: string; href: string; category: 'Student' | 'Coach' | 'Match'
}

// ── Role styling ──────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<SessionUser['role'], string> = {
  admin:   'var(--accent-gold)',
  coach:   'var(--accent-green)',
  parent:  '#3b82f6',
  student: '#a855f7',
}

// ── Nav config ────────────────────────────────────────────────────────────────

const ALL_NAV = [
  { label: 'Dashboard',    href: '/dashboard',                  Icon: IconHome          },
  { label: 'Students',     href: '/dashboard/students',         Icon: IconUsers         },
  { label: 'Attendance',   href: '/dashboard/attendance',       Icon: IconCalendarCheck },
  { label: 'Matches',      href: '/dashboard/matches',          Icon: IconTrophy        },
  { label: 'Coaches',      href: '/dashboard/coaches',          Icon: IconClipboardList },
  { label: 'Payments',     href: '/dashboard/payments',         Icon: IconCash          },
  { label: 'Ratings',      href: '/dashboard/ratings',          Icon: IconStar          },
  { label: 'Reports',      href: '/dashboard/reports',          Icon: IconChartBar      },
  // Routes not built yet — rendered disabled with a "Soon" badge, see Sidebar's nav loop.
  { label: 'Programs',     href: '/dashboard/content/programs',     Icon: IconListDetails, comingSoon: true },
  { label: 'Testimonials', href: '/dashboard/content/testimonials', Icon: IconQuote,       comingSoon: true },
  { label: 'Gallery',      href: '/dashboard/content/gallery',      Icon: IconPhoto,       comingSoon: true },
  { label: 'Settings',     href: '/dashboard/settings',             Icon: IconSettings,    comingSoon: true },
]

function navItemsFor(user: SessionUser) {
  if (user.role === 'admin') return ALL_NAV
  if (user.role === 'coach') return ALL_NAV.filter(n => !['Payments', 'Settings', 'Programs', 'Testimonials', 'Gallery'].includes(n.label))
  return [
    { label: 'My Profile', href: `/dashboard/students/${user.studentId ?? ''}`, Icon: IconBuildingArch },
    { label: 'Matches',    href: '/dashboard/matches', Icon: IconTrophy },
  ]
}

// ── Academy Switcher ──────────────────────────────────────────────────────────

function AcademySwitcher({ user }: { user: SessionUser }) {
  const options: AcademyFilter[] = user.academies.length === 2
    ? ['Both', 'MFA', 'MBA']
    : [user.academies[0]]

  if (options.length < 2) return null

  const acColors: Record<string, string> = {
    MFA: 'var(--accent-green)',
    MBA: 'var(--accent-orange)',
    Both: 'var(--accent-gold)',
  }
  const acHex: Record<string, string> = { MFA: '#16a34a', MBA: '#f97316', Both: '#f5c518' }

  return (
    <div style={{ padding: '4px 12px 8px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px 4px' }}>
        Academy
      </p>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(opt => {
          const active = user.selectedAcademy === opt
          const col = acColors[opt]
          const hex = acHex[opt]
          return (
            <button
              key={opt}
              onClick={() => {
                setSelectedAcademy(opt)
                window.dispatchEvent(new Event('mila_academy_changed'))
              }}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, fontWeight: 700,
                border: `1px solid ${active ? hex : 'var(--border)'}`,
                backgroundColor: active ? `${hex}22` : 'transparent',
                color: active ? col : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Global Search ─────────────────────────────────────────────────────────────

const COACH_NAMES = ['Ahmad Nader', 'Bilal Akar', 'Samer Khalil', 'Nadia Frem']
const COACH_SPECS = ['Attack & Finishing', 'Youth Development', 'Basketball — Guard Play', 'Fitness & Conditioning']

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const router = useRouter()
  const ref    = useRef<HTMLDivElement>(null)

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []
    const lq  = query.toLowerCase()
    const out: SearchResult[] = []

    try {
      loadAllStudents().forEach(s => {
        if (s.name.toLowerCase().includes(lq) || String(s.jersey_number).includes(lq) || s.position.toLowerCase().includes(lq)) {
          out.push({ label: s.name, sub: `#${s.jersey_number} · ${s.position} · ${s.team_id}`, href: `/dashboard/students/${s.id}`, category: 'Student' })
        }
      })
    } catch {}

    COACH_NAMES.forEach((name, i) => {
      if (name.toLowerCase().includes(lq) || COACH_SPECS[i].toLowerCase().includes(lq)) {
        out.push({ label: name, sub: COACH_SPECS[i], href: '/dashboard/coaches', category: 'Coach' })
      }
    })

    try {
      const matches: Array<{ id: string; opponent: string; team_name: string; date: string; status: string }> =
        JSON.parse(localStorage.getItem('mila_matches') ?? '[]')
      matches.forEach(m => {
        if (m.opponent.toLowerCase().includes(lq) || m.team_name.toLowerCase().includes(lq)) {
          out.push({ label: `vs ${m.opponent}`, sub: `${m.team_name} · ${m.date} · ${m.status}`, href: '/dashboard/matches', category: 'Match' })
        }
      })
    } catch {}

    return out.slice(0, 8)
  }, [query])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const CAT_COLORS: Record<string, string> = {
    Student: 'var(--accent-green)',
    Coach:   'var(--accent-gold)',
    Match:   'var(--accent-orange)',
  }

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 380, width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        backgroundColor: 'var(--bg-card)',
        border: `0.5px solid ${open ? '#f5c518' : 'var(--border)'}`,
        borderRadius: 10, padding: '8px 14px', transition: 'border-color 0.15s',
      }}>
        <IconSearch size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search students, coaches, matches…"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-secondary)', fontSize: 13 }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
            <IconX size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
          backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', zIndex: 500,
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => { router.push(r.href); setOpen(false); setQuery('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderTop: i > 0 ? `1px solid var(--border)` : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ fontSize: 10, fontWeight: 800, color: CAT_COLORS[r.category] ?? 'var(--text-secondary)', minWidth: 48, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.category}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  user, pathname, onLogout, open, onClose,
}: {
  user: SessionUser; pathname: string; onLogout: () => void; open: boolean; onClose: () => void
}) {
  const initials = user.name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
  const navItems = navItemsFor(user)
  const accentHex: Record<string, string> = { MFA: '#16a34a', MBA: '#f97316', Both: '#f5c518' }

  return (
    <>
      {/* Mobile overlay */}
      <div className={`dash-sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />

      <aside
        className={`dash-sidebar${open ? ' open' : ''}`}
        style={{
          borderLeft: `3px solid ${accentHex[user.selectedAcademy] ?? 'transparent'}`,
        }}
      >
        {/* Top: logos + brand */}
        <div style={{ padding: '24px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Image src="/logos/mfa_navbar.png" alt="MFA" width={56} height={36} style={{ height: 36, width: 'auto' }} />
            <div style={{ width: 1, height: 28, backgroundColor: 'var(--accent-gold)', opacity: 0.4 }} />
            <Image src="/logos/mba_navbar.png" alt="MBA" width={56} height={36} style={{ height: 36, width: 'auto' }} />
          </div>
          <p style={{ textAlign: 'center', color: 'var(--accent-gold)', fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: '12px 0 16px' }}>
            MILA ACADEMY
          </p>
          <div style={{ height: 1, backgroundColor: 'rgba(245,197,24,0.12)', marginBottom: 12 }} />
        </div>

        <AcademySwitcher user={user} />

        <nav style={{ flex: 1, padding: '4px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ label, href, Icon, comingSoon }) => (
            comingSoon ? (
              <div
                key={href}
                className="nav-item"
                aria-disabled="true"
                title={`${label} — coming soon`}
                style={{ cursor: 'default', opacity: 0.45, pointerEvents: 'none' }}
              >
                <Icon size={20} stroke={1.8} />
                {label}
                <span style={{
                  marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                  textTransform: 'uppercase', padding: '2px 6px', borderRadius: 20,
                  border: '1px solid var(--border)', color: 'var(--text-muted)',
                }}>
                  Soon
                </span>
              </div>
            ) : (
              <Link key={href} href={href} className={`nav-item${pathname === href ? ' active' : ''}`} onClick={onClose}>
                <Icon size={20} stroke={1.8} />
                {label}
              </Link>
            )
          ))}
        </nav>

        {/* Bottom: user info + logout + back to site */}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              backgroundColor: 'rgba(245,197,24,0.15)', border: '1.5px solid rgba(245,197,24,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: 'var(--accent-gold)', fontWeight: 700, fontSize: 13,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <span style={{
                display: 'inline-block', marginTop: 3, padding: '1px 8px',
                borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                textTransform: 'uppercase',
                backgroundColor: `${({ admin: '#f5c518', coach: '#16a34a', parent: '#3b82f6', student: '#a855f7' }[user.role])}22`,
                color: ROLE_COLORS[user.role],
                border: `1px solid ${({ admin: '#f5c518', coach: '#16a34a', parent: '#3b82f6', student: '#a855f7' }[user.role])}44`,
              }}>
                {user.role}
              </span>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            <IconLogout size={16} stroke={1.8} />
            Sign out
          </button>

          <Link href="/" className="back-site-link">
            <span style={{ fontSize: 14 }}>←</span>
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user,        setUser]        = useState<SessionUser | null>(null)
  const [checking,    setChecking]    = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme,       setTheme]       = useState<'dark' | 'light'>('dark')
  const router   = useRouter()
  const pathname = usePathname()

  // Touch tracking for swipe gestures
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    seedUsers()

    if (pathname === '/dashboard/login') {
      setChecking(false)
      return
    }

    const stored = getCurrentUser()
    if (!stored?.loggedIn) {
      router.replace('/dashboard/login')
      return
    }

    setUser(stored)
    setChecking(false)
  }, [pathname, router])

  // Sync theme from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem('mila-theme') ?? 'dark') as 'dark' | 'light'
    setTheme(saved)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar on desktop resize
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Swipe gesture on main content
  useEffect(() => {
    const main = document.getElementById('dash-main')
    if (!main) return

    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
      if (dy > 60) return // mostly vertical swipe
      if (dx > 60 && touchStartX.current < 40) setSidebarOpen(true)
      if (dx < -60) setSidebarOpen(false)
    }

    main.addEventListener('touchstart', onTouchStart, { passive: true })
    main.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      main.removeEventListener('touchstart', onTouchStart)
      main.removeEventListener('touchend',   onTouchEnd)
    }
  }, [checking])

  // Re-read user when academy switcher fires
  useEffect(() => {
    function onAcademyChange() {
      const u = getCurrentUser()
      if (u) setUser({ ...u })
    }
    window.addEventListener('mila_academy_changed', onAcademyChange)
    return () => window.removeEventListener('mila_academy_changed', onAcademyChange)
  }, [])

  function handleLogout() {
    logout()
    router.replace('/dashboard/login')
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('mila-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(next)
  }

  if (pathname === '/dashboard/login') {
    if (checking) return null
    return <>{children}</>
  }

  if (checking || !user) return null

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg)' }}>
        <Sidebar
          user={user}
          pathname={pathname}
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div id="dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* ── Header ── */}
          <header
            className="dash-header"
            style={{
              height: 60, flexShrink: 0,
              backgroundColor: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center',
              padding: '0 20px', gap: 12,
            }}
          >
            {/* Hamburger — mobile only */}
            <button
              className="dash-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer',
                padding: 4, borderRadius: 6, display: 'none',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconMenu2 size={22} />
            </button>

            {/* Brand title — mobile center */}
            <div
              className="dash-header-title"
              style={{
                flex: 1, textAlign: 'center',
                color: 'var(--accent-gold)', fontSize: 13, fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase', display: 'none',
              }}
            >
              MILA ACADEMY
            </div>

            {/* Search — desktop */}
            <div className="dash-search" style={{ flex: 1, maxWidth: 380 }}>
              <GlobalSearch />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Date — desktop */}
              <span className="dash-header-date" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)', border: '0.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0,
                }}
              >
                {theme === 'dark' ? <IconSun size={17} stroke={1.8} /> : <IconMoon size={17} stroke={1.8} />}
              </button>
            </div>
          </header>

          <main
            className="dash-main-content"
            style={{ flex: 1, overflowY: 'auto', padding: 32 }}
          >
            {children}
          </main>
        </div>
      </div>

      <ToastContainer />
    </>
  )
}

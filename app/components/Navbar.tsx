'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { scrollToSection } from '@/lib/lenis-store'

const NAV_LINKS = [
  { label: 'Home',     id: 'hero'     },
  { label: 'About',    id: 'about'    },
  { label: 'Programs', id: 'programs' },
  { label: 'Gallery',  id: 'gallery'  },
  { label: 'Contact',  id: 'contact'  },
]

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('mila-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('mila-theme', next)
    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(next)
  }

  function handleNav(id: string) {
    setMenuOpen(false)
    scrollToSection(id === 'hero' ? 'top' : id)
  }

  return (
    <>
      <style>{`
        .nb-link {
          background: none; border: none; padding: 0;
          color: var(--color-text); font-size: 13px;
          font-family: inherit; cursor: pointer;
          transition: color 0.15s ease;
          white-space: nowrap;
          min-height: 44px; display: inline-flex; align-items: center;
        }
        .nb-link:hover { color: #888; }
        .nb-dash {
          color: var(--color-text); font-size: 13px; font-weight: 500;
          padding: 7px 16px; border-radius: 6px;
          border: 1px solid #333; text-decoration: none;
          white-space: nowrap; transition: border-color 0.15s ease;
          min-height: 44px; display: inline-flex; align-items: center;
        }
        .nb-dash:hover { border-color: var(--color-text); }
        .nb-join {
          background: none; border: none; padding: 0;
          color: var(--color-text-dim); font-size: 13px;
          font-family: inherit; cursor: pointer;
          transition: color 0.15s ease; white-space: nowrap;
          min-height: 44px; display: inline-flex; align-items: center;
        }
        .nb-join:hover { color: var(--color-text); }
        .nb-theme {
          background: none; border: none;
          color: var(--color-text-dim); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 8px; border-radius: 6px; transition: color 0.15s ease;
          min-height: 44px; min-width: 44px;
        }
        .nb-theme:hover { color: var(--color-text); }
        .nb-hamburger {
          background: none; border: none; color: var(--color-text);
          cursor: pointer; padding: 8px; display: none;
          align-items: center; justify-content: center;
          min-height: 44px; min-width: 44px;
        }
        @media (max-width: 768px) {
          .nb-center { display: none !important; }
          .nb-hamburger { display: flex !important; }
        }
        /* Mobile overlay links */
        .mob-link {
          background: none; border: none; color: #fff;
          font-size: 20px; font-weight: 600; font-family: inherit;
          cursor: pointer; padding: 12px 32px; min-height: 44px;
          text-align: center;
        }
      `}</style>

      {/* ── Navbar bar ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 60, zIndex: 1000,
        backgroundColor: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 0,
      }}>
        {/* Left: brand */}
        <span style={{
          color: 'var(--color-text)', fontSize: 13, fontWeight: 600,
          letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          MILA ACADEMY
        </span>

        {/* Center: nav links */}
        <div className="nb-center" style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 32,
        }}>
          {NAV_LINKS.map(l => (
            <button key={l.id} className="nb-link" onClick={() => handleNav(l.id)}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Spacer on desktop when center is hidden */}
        <div style={{ flex: 1 }} className="nb-center" aria-hidden />

        {/* Right: join + theme + dashboard + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 'auto' }}>
          <button className="nb-join" onClick={() => handleNav('contact')} style={{ marginRight: 8 }}>
            Join Now
          </button>
          <button className="nb-theme" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link href="/dashboard" className="nb-dash" style={{ marginLeft: 8 }}>
            Dashboard
          </Link>
          <button
            className="nb-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{ marginLeft: 4 }}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* ── Mobile fullscreen overlay ────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: '#0a0a0a',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute', top: 16, right: 20,
              background: 'none', border: 'none', color: '#fff',
              cursor: 'pointer', padding: 8, minHeight: 44, minWidth: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
          {NAV_LINKS.map(l => (
            <button key={l.id} className="mob-link" onClick={() => handleNav(l.id)}>
              {l.label}
            </button>
          ))}
          <button className="mob-link" onClick={() => handleNav('contact')} style={{ color: '#888', fontSize: 16, marginTop: 8 }}>
            Join Now
          </button>
        </div>
      )}
    </>
  )
}

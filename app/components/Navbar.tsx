'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { scrollToSection } from '@/lib/lenis-store'
import { useTheme, toggleTheme } from '@/lib/theme'
import type { SiteContent } from '@/lib/content-schema'

const NAV_LINKS = [
  { key: 'nav_home',     id: 'hero'     },
  { key: 'nav_about',    id: 'about'    },
  { key: 'nav_programs', id: 'programs' },
  { key: 'nav_gallery',  id: 'gallery'  },
  { key: 'nav_contact',  id: 'contact'  },
] as const

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

export default function Navbar({
  content,
  hasGallery = true,
  hasPrograms = true,
}: { content: SiteContent; hasGallery?: boolean; hasPrograms?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const theme = useTheme()
  const router = useRouter()
  // A nav item whose section isn't on the page is a dead link — Programs and
  // Gallery each render nothing when their table is empty.
  const navLinks = NAV_LINKS.filter(l =>
    (l.id !== 'gallery'  || hasGallery) &&
    (l.id !== 'programs' || hasPrograms)
  ).map(l => ({ id: l.id, label: content[l.key] }))

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Esc closes the fullscreen mobile menu — it was previously dismissable only
  // by hitting the small × or picking a link.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function handleNav(id: string) {
    setMenuOpen(false)
    // Falls back to the homepage anchor when the section isn't on this page
    // (the academy pages render only #programs and #enroll).
    if (!scrollToSection(id === 'hero' ? 'top' : id)) {
      router.push(`/#${id}`)
    }
  }

  return (
    <>
      <style>{`
        .nb-link {
          background: none; border: none;
          color: var(--color-text); font-size: 13px;
          font-family: inherit; cursor: pointer;
          transition: color 0.15s ease, background-color 0.15s ease;
          white-space: nowrap;
          min-height: 44px; padding: 0 12px; border-radius: 8px;
          display: inline-flex; align-items: center;
        }
        .nb-link:hover { color: var(--color-gold); background-color: rgba(var(--color-gold-rgb), 0.1); }
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
          background: none; border: none; color: var(--color-text);
          font-size: 20px; font-weight: 600; font-family: inherit;
          cursor: pointer; padding: 12px 32px; min-height: 44px;
          text-align: center;
        }
      `}</style>

      {/* ── Navbar bar ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 60, zIndex: 1000,
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 0,
      }}>
        {/* Left: brand */}
        <span style={{
          color: 'var(--color-text)', fontSize: 13, fontWeight: 600,
          letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {content.brand_name}
        </span>

        {/* Center: nav links */}
        <div className="nb-center" style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 32,
        }}>
          {navLinks.map(l => (
            <button key={l.id} className="nb-link" onClick={() => handleNav(l.id)}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Spacer on desktop when center is hidden */}
        <div style={{ flex: 1 }} className="nb-center" aria-hidden />

        {/* Right: enroll + theme + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 'auto' }}>
          <button className="nb-join" onClick={() => handleNav('contact')} style={{ marginRight: 8 }}>
            {content.nav_enroll}
          </button>
          <button
            className="nb-theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
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
        <div role="dialog" aria-modal="true" aria-label="Site menu" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'var(--color-bg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute', top: 16, right: 20,
              background: 'none', border: 'none', color: 'var(--color-text)',
              cursor: 'pointer', padding: 8, minHeight: 44, minWidth: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
          {navLinks.map(l => (
            <button key={l.id} className="mob-link" onClick={() => handleNav(l.id)}>
              {l.label}
            </button>
          ))}
          <button className="mob-link" onClick={() => handleNav('contact')} style={{ color: 'var(--color-text-dim)', fontSize: 16, marginTop: 8 }}>
            {content.nav_enroll}
          </button>
        </div>
      )}
    </>
  )
}

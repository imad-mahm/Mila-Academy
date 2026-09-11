'use client'
import Image from 'next/image'
import { SITE_CONFIG } from '@/lib/site-config'
import { scrollToSection } from '@/lib/lenis-store'

const NAV_LINKS = [
  { label: 'Home',     id: 'top'      },
  { label: 'About',    id: 'about'    },
  { label: 'Programs', id: 'programs' },
  { label: 'Gallery',  id: 'gallery'  },
  { label: 'Contact',  id: 'contact'  },
]

function IgSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function FbSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function YtSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  )
}

const SOCIALS = [
  { href: SITE_CONFIG.social.instagram, icon: <IgSvg />, label: 'Instagram' },
  { href: SITE_CONFIG.social.facebook,  icon: <FbSvg />, label: 'Facebook'  },
  { href: SITE_CONFIG.social.youtube,   icon: <YtSvg />, label: 'YouTube'   },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid rgba(var(--color-gold-rgb),0.15)' }}>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 56px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 72px 24px 56px;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 40px; padding: 56px 24px 40px; }
        }
        .footer-link {
          color: var(--color-text-dim);
          text-decoration: none;
          font-size: 14px;
          line-height: 1;
          transition: color 0.2s ease;
        }
        .footer-link:hover { color: var(--color-gold); }
        .footer-social-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(var(--color-gold-rgb),0.08);
          border: 1px solid rgba(var(--color-gold-rgb),0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-gold);
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .footer-social-btn:hover {
          background: rgba(var(--color-gold-rgb),0.18);
          border-color: rgba(var(--color-gold-rgb),0.5);
        }
      `}</style>

      <div className="footer-grid">
        {/* Brand column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Image
              src="/logos/mfa_navbar.png"
              alt="Mila Football Academy"
              width={60}
              height={40}
              style={{ height: 40, width: 'auto' }}
            />
            <div style={{ width: 1, height: 28, backgroundColor: 'var(--color-gold)', opacity: 0.3 }} />
            <Image
              src="/logos/mba_navbar.png"
              alt="Mila Basket Academy"
              width={60}
              height={40}
              style={{ height: 40, width: 'auto' }}
            />
          </div>
          <p style={{ color: 'var(--color-text-faintest)', fontSize: 13, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>
            Train with the best in Lebanon.<br />
            Developing the next generation of athletes since 2016.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {SOCIALS.map(({ href, icon, label }) => (
              <a key={label} href={href} aria-label={label} className="footer-social-btn">
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links column */}
        <div>
          <p style={{ color: 'var(--color-gold)', fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 22px' }}>
            Navigation
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="footer-link"
                style={{ background: 'none', border: 'none', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contact column */}
        <div>
          <p style={{ color: 'var(--color-gold)', fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 22px' }}>
            Contact
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: SITE_CONFIG.location },
              { label: SITE_CONFIG.phoneDisplay },
              { label: SITE_CONFIG.email },
              { label: SITE_CONFIG.hours },
            ].map(({ label }) => (
              <p key={label} style={{ color: 'var(--color-text-faint)', fontSize: 13, margin: 0 }}>{label}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <p style={{ color: 'var(--color-text-faintest)', fontSize: 12, margin: 0 }}>
          © 2024 Mila Football Academy. All rights reserved.
        </p>
        <p style={{ color: 'var(--color-text-faintest)', fontSize: 12, margin: 0 }}>
          Built with passion · Lebanon
        </p>
      </div>
    </footer>
  )
}

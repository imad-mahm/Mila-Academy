import Image from 'next/image'
import Link from 'next/link'
import type { SiteSettings } from '@/lib/site-data'
import { ACADEMY_META, type Academy } from '@/lib/programs'
import ProgramsExplorer from './ProgramsExplorer'

export default function AcademyLanding({ academy, settings }: { academy: Academy; settings: SiteSettings }) {
  const meta = ACADEMY_META[academy]
  // Empty when site_settings has no number — the WhatsApp CTAs are hidden in
  // that case rather than pointing at a bare https://wa.me/ .
  const wa = settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : ''

  const heroBtn: React.CSSProperties = {
    padding: '12px 26px', borderRadius: 8, fontWeight: 700, fontSize: 14,
    textDecoration: 'none', color: '#fff',
  }

  return (
    <main>
      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: 460, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px 0',
      }}>
        {/* Branded backdrop in the academy's accent colour.
            REPLACE WITH REAL PHOTOGRAPHY: this used to pull a random photo from
            picsum.photos, which put unrelated stock images of strangers behind
            the hero of a children's sports academy — and made the hero depend on
            a third-party service staying up. Swap in a real training photo when
            the academy supplies one. */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundColor: '#0a0a0a',
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${meta.accentRgb}, 0.28) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 80% 100%, rgba(245, 197, 24, 0.12) 0%, transparent 70%)
            `,
          }}
        />
        {/* Scrim keeps the white hero text readable in both themes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 14, padding: '48px 0',
        }}>
          <Image src={meta.logo} alt={meta.name} width={96} height={64} style={{ height: 64, width: 'auto' }} preload />
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
            {meta.name}
          </h1>
          <p style={{ color: meta.accent, fontSize: 16, fontWeight: 600, letterSpacing: '0.5px', margin: 0 }}>
            {meta.tagline}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>{meta.est}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
            <a href="#programs" style={{ ...heroBtn, backgroundColor: meta.accent }}>View Programs</a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...heroBtn, backgroundColor: '#25D366' }}>
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Sortable / filterable programs ──────────────────────────────────── */}
      <ProgramsExplorer academy={academy} />

      {/* ── Enroll CTA ──────────────────────────────────────────────────────── */}
      <section id="enroll" style={{
        backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
        padding: '72px 24px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ color: 'var(--color-text)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.15 }}>
            Ready to join {meta.short}?
          </h2>
          <p style={{ color: 'var(--color-text-dim)', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
            Reach out and our team will help you choose the right program and get started.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" style={{
                backgroundColor: '#25D366', color: '#fff', padding: '13px 28px', borderRadius: 10,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
              }}>
                Chat on WhatsApp
              </a>
            )}
            <Link href="/#contact" style={{
              backgroundColor: 'transparent', color: meta.accent, border: `1px solid ${meta.accent}`,
              padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>
              Enroll Now →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

'use client'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SiteContent } from '@/lib/content-schema'


export default function Hero({ content }: { content: SiteContent }) {
  const [leftHov,  setLeftHov]  = useState(false)
  const [rightHov, setRightHov] = useState(false)

  // Layout is driven by CSS media queries, not a JS `isMobile` flag. The flag
  // started false on the server, so phones rendered the side-by-side desktop
  // hero on first paint and only snapped to the stacked layout after hydration.
  const halfBase: CSSProperties = {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: 'var(--color-bg)',
    position: 'relative',
    overflow: 'hidden',
  }

  const enterBtn: CSSProperties = {
    backgroundColor: 'var(--color-text)',
    color: 'var(--color-bg)',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
    fontFamily: 'inherit',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'opacity 0.15s ease',
    marginTop: 4,
  }

  return (
    <>
      <style>{`
        @keyframes ballSpinY {
          from { transform: rotateZ(0deg); }
          to   { transform: rotateZ(360deg); }
        }
        .enter-btn:hover { opacity: 0.85 !important; }

        .hero-split {
          /* dvh tracks the collapsing mobile URL bar; vh is the fallback for
             browsers without it, where 100vh overflows behind the bar. */
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: row;
          padding-top: 60px;
        }
        /* The ball shrinks with the viewport instead of holding 280px and
           pushing the name and Enter button off a short screen. */
        .hero-ball { width: 280px; height: 280px; }
        .hero-divider { width: 1px; height: auto; }

        @media (max-width: 768px) {
          .hero-split   { flex-direction: column; }
          .hero-ball    { width: min(280px, 34vh); height: min(280px, 34vh); }
          .hero-divider { width: auto; height: 1px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-ball img { animation: none !important; }
        }
      `}</style>

      <section id="hero" className="hero-split">
        {/* ── Left: Football ──────────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setLeftHov(true)}
          onMouseLeave={() => setLeftHov(false)}
          style={halfBase}
        >
          <div className="hero-ball" style={{
            position: 'relative', flexShrink: 0,
            perspective: 700,
            filter: leftHov
              ? 'drop-shadow(0 0 48px rgba(22,163,74,0.45))'
              : 'drop-shadow(0 0 32px rgba(22,163,74,0.2))',
            transition: 'filter 0.3s ease',
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <Image
                src={content.football_ball_image}
                alt="Football"
                width={280}
                height={280}
                draggable={false}
                loading="eager"
                style={{
                  display: 'block', width: '100%', height: '100%',
                  animation: 'ballSpinY 6s linear infinite',
                  userSelect: 'none',
                }}
              />
            </div>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle at 36% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 50%, rgba(0,0,0,0.2) 100%)',
            }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              {content.football_name}
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>
              {content.football_est}
            </p>
          </div>

          <Link href="/football" className="enter-btn" style={enterBtn}>
            {content.hero_enter_label}
          </Link>
        </div>

        {/* ── Divider (vertical on desktop, horizontal when stacked) ──────────── */}
        <div className="hero-divider" style={{ backgroundColor: 'var(--color-border-soft)', flexShrink: 0, alignSelf: 'stretch' }} />

        {/* ── Right: Basketball ───────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setRightHov(true)}
          onMouseLeave={() => setRightHov(false)}
          style={halfBase}
        >
          <div className="hero-ball" style={{
            position: 'relative', flexShrink: 0,
            perspective: 700,
            filter: rightHov
              ? 'drop-shadow(0 0 48px rgba(249,115,22,0.5))'
              : 'drop-shadow(0 0 32px rgba(249,115,22,0.2))',
            transition: 'filter 0.3s ease',
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <Image
                src={content.basketball_ball_image}
                alt="Basketball"
                width={280}
                height={280}
                draggable={false}
                loading="eager"
                style={{
                  display: 'block', width: '100%', height: '100%',
                  animation: 'ballSpinY 4s linear infinite',
                  userSelect: 'none',
                }}
              />
            </div>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle at 36% 30%, rgba(255,220,150,0.45) 0%, rgba(255,255,255,0.0) 50%, rgba(0,0,0,0.2) 100%)',
            }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text)', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              {content.basketball_name}
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>
              {content.basketball_est}
            </p>
          </div>

          <Link href="/basketball" className="enter-btn" style={enterBtn}>
            {content.hero_enter_label}
          </Link>
        </div>
      </section>
    </>
  )
}

'use client'
import type { CSSProperties } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'


export default function Hero() {
  const [isMobile, setIsMobile] = useState(false)
  const [leftHov,  setLeftHov]  = useState(false)
  const [rightHov, setRightHov] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const halfBase: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: 'var(--color-bg)',
    position: 'relative',
    overflow: 'hidden',
    ...(isMobile ? { width: '100%', height: '50vh', flex: 'none' } : {}),
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
      `}</style>

      <section
        id="hero"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          paddingTop: 60,
        }}
      >
        {/* ── Left: Football ──────────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setLeftHov(true)}
          onMouseLeave={() => setLeftHov(false)}
          style={halfBase}
        >
          <div style={{
            position: 'relative', width: 280, height: 280, flexShrink: 0,
            perspective: 700,
            filter: leftHov
              ? 'drop-shadow(0 0 48px rgba(22,163,74,0.45))'
              : 'drop-shadow(0 0 32px rgba(22,163,74,0.2))',
            transition: 'filter 0.3s ease',
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <Image
                src="/logos/football-ball-soccer-svgrepo-com.svg"
                alt="Football"
                width={280}
                height={280}
                draggable={false}
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
              Mila Football Academy
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>
              Est. 2016 · Lebanon
            </p>
          </div>

          <Link href="/football" className="enter-btn" style={enterBtn}>
            Enter →
          </Link>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────────── */}
        {isMobile ? null : (
          <div style={{ width: 1, backgroundColor: 'var(--color-border-soft)', flexShrink: 0, alignSelf: 'stretch' }} />
        )}

        {/* ── Right: Basketball ───────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setRightHov(true)}
          onMouseLeave={() => setRightHov(false)}
          style={halfBase}
        >
          <div style={{
            position: 'relative', width: 280, height: 280, flexShrink: 0,
            perspective: 700,
            filter: rightHov
              ? 'drop-shadow(0 0 48px rgba(249,115,22,0.5))'
              : 'drop-shadow(0 0 32px rgba(249,115,22,0.2))',
            transition: 'filter 0.3s ease',
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <Image
                src="/logos/ball-of-basketball-svgrepo-com.svg"
                alt="Basketball"
                width={280}
                height={280}
                draggable={false}
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
              Mila Basket Academy
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 13, margin: 0 }}>
              Est. 2024 · Baissour
            </p>
          </div>

          <Link href="/basketball" className="enter-btn" style={enterBtn}>
            Enter →
          </Link>
        </div>
      </section>
    </>
  )
}

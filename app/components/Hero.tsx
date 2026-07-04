'use client'
import type { CSSProperties } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Football SVG — classic black-pentagon soccer ball ─────────────────────────
function FootballSVG({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', ...style }}>
      <defs>
        <clipPath id="fb-clip">
          <circle cx="140" cy="140" r="134" />
        </clipPath>
      </defs>
      <circle cx="140" cy="140" r="136" fill="#f5f5f5" />
      <g clipPath="url(#fb-clip)" fill="#111111">
        <polygon points="140,20 169,41 158,74 122,74 111,41" />
        <polygon points="73,62 100,81 90,113 57,113 46,81" />
        <polygon points="207,62 180,81 190,113 223,113 234,81" />
        <polygon points="15,135 40,112 63,130 61,162 36,175" />
        <polygon points="265,135 240,112 217,130 219,162 244,175" />
        <polygon points="73,218 100,199 90,167 57,167 46,199" />
        <polygon points="207,218 180,199 190,167 223,167 234,199" />
        <polygon points="140,260 169,239 158,206 122,206 111,239" />
      </g>
      <circle cx="140" cy="140" r="136" fill="none" stroke="#111111" strokeWidth="3" />
    </svg>
  )
}

// ── Basketball SVG — orange with curved seam lines ────────────────────────────
function BasketballSVG({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', ...style }}>
      <defs>
        <clipPath id="bb-clip">
          <circle cx="140" cy="140" r="135" />
        </clipPath>
      </defs>
      <circle cx="140" cy="140" r="136" fill="#e8621a" />
      <g clipPath="url(#bb-clip)" fill="none" stroke="#3d1500" strokeWidth="4" strokeLinecap="round">
        <path d="M 4,140 Q 140,65 276,140" />
        <path d="M 4,140 Q 140,215 276,140" />
        <path d="M 140,4 Q 65,140 140,276" />
        <path d="M 140,4 Q 215,140 140,276" />
      </g>
      <circle cx="140" cy="140" r="136" fill="none" stroke="#3d1500" strokeWidth="3" />
    </svg>
  )
}

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
    backgroundColor: '#0a0a0a',
    position: 'relative',
    overflow: 'hidden',
    ...(isMobile ? { width: '100%', height: '50vh', flex: 'none' } : {}),
  }

  const enterBtn: CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#0a0a0a',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
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
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
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
          <div style={{ perspective: 700, width: 280, height: 280, flexShrink: 0 }}>
            <FootballSVG style={{
              width: '100%',
              height: '100%',
              filter: leftHov
                ? 'drop-shadow(0 0 48px rgba(22,163,74,0.45))'
                : 'drop-shadow(0 0 32px rgba(22,163,74,0.2))',
              animation: 'ballSpinY linear infinite',
              animationDuration: leftHov ? '2s' : '6s',
              transition: 'filter 0.3s ease',
            }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ffffff', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              Mila Football Academy
            </p>
            <p style={{ color: '#888888', fontSize: 13, margin: 0 }}>
              Est. 2016 · Lebanon
            </p>
          </div>

          <Link href="/football" className="enter-btn" style={enterBtn}>
            Enter →
          </Link>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────────── */}
        {isMobile ? null : (
          <div style={{ width: 1, backgroundColor: '#242424', flexShrink: 0, alignSelf: 'stretch' }} />
        )}

        {/* ── Right: Basketball ───────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setRightHov(true)}
          onMouseLeave={() => setRightHov(false)}
          style={halfBase}
        >
          <div style={{ perspective: 700, width: 280, height: 280, flexShrink: 0 }}>
            <BasketballSVG style={{
              width: '100%',
              height: '100%',
              filter: rightHov
                ? 'drop-shadow(0 0 48px rgba(249,115,22,0.5))'
                : 'drop-shadow(0 0 32px rgba(249,115,22,0.2))',
              animation: 'ballSpinY 4s linear infinite',
              transition: 'filter 0.3s ease',
            }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ffffff', fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              Mila Basket Academy
            </p>
            <p style={{ color: '#888888', fontSize: 13, margin: 0 }}>
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

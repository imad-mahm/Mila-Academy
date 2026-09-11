'use client'
import { useState } from 'react'
import { IconBallFootball, IconBallBasketball } from '@tabler/icons-react'
import { scrollToSection } from '@/lib/lenis-store'

const PROGRAMS = [
  {
    icon: 'football' as const,
    name: 'Under 8',
    subtitle: 'Little Champions',
    color: 'var(--color-football)',
    colorRgb: 'var(--color-football-rgb)',
    age: 'Ages 5–8',
    freq: '2× / week',
    price: '$50 / month',
  },
  {
    icon: 'football' as const,
    name: 'Under 12',
    subtitle: 'Rising Stars',
    color: 'var(--color-football)',
    colorRgb: 'var(--color-football-rgb)',
    age: 'Ages 9–12',
    freq: '3× / week',
    price: '$70 / month',
  },
  {
    icon: 'football' as const,
    name: 'Under 16',
    subtitle: 'Elite Youth',
    color: 'var(--color-football)',
    colorRgb: 'var(--color-football-rgb)',
    age: 'Ages 13–16',
    freq: '4× / week',
    price: '$90 / month',
  },
  {
    icon: 'football' as const,
    name: 'Adult Academy',
    subtitle: 'Pro Level',
    color: 'var(--color-football)',
    colorRgb: 'var(--color-football-rgb)',
    age: 'Ages 17+',
    freq: '5× / week',
    price: '$110 / month',
  },
  {
    icon: 'basketball' as const,
    name: 'Basketball U14',
    subtitle: 'Court Kings',
    color: 'var(--color-basketball)',
    colorRgb: 'var(--color-basketball-rgb)',
    age: 'Ages 10–14',
    freq: '3× / week',
    price: '$65 / month',
  },
  {
    icon: 'basketball' as const,
    name: 'Basketball Adult',
    subtitle: 'Hoop Masters',
    color: 'var(--color-basketball)',
    colorRgb: 'var(--color-basketball-rgb)',
    age: 'Ages 15+',
    freq: '4× / week',
    price: '$85 / month',
  },
]

export default function Programs() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section id="programs" style={{ backgroundColor: 'var(--color-bg)', padding: '100px 24px' }}>
      <style>{`
        .programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 1024px) { .programs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .programs-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 36px' }}>
        <h2
          style={{
            color: 'var(--color-text)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            margin: '0 0 10px',
            lineHeight: 1.1,
          }}
        >
          Our Programs
        </h2>
        <p
          style={{
            color: 'var(--color-gold)',
            fontSize: 14,
            margin: 0,
            letterSpacing: '1px',
          }}
        >
          Choose your path
        </p>
      </div>

      {/* Cards grid */}
      <div className="programs-grid">
        {PROGRAMS.map((prog, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: `0.5px solid ${hoveredCard === i ? prog.color : 'var(--color-border)'}`,
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              boxShadow:
                hoveredCard === i
                  ? `0 0 30px rgba(${prog.colorRgb}, 0.2)`
                  : 'none',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: `rgba(${prog.colorRgb}, 0.12)`,
                border: `1px solid rgba(${prog.colorRgb}, 0.3)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                flexShrink: 0,
                color: prog.color,
              }}
            >
              {prog.icon === 'football'
                ? <IconBallFootball size={26} stroke={1.75} />
                : <IconBallBasketball size={26} stroke={1.75} />}
            </div>

            {/* Name */}
            <p
              style={{
                color: 'var(--color-text)',
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 5px',
              }}
            >
              {prog.name}
            </p>

            {/* Subtitle */}
            <p
              style={{
                color: 'var(--color-gold)',
                fontSize: 13,
                fontWeight: 500,
                margin: '0 0 22px',
              }}
            >
              {prog.subtitle}
            </p>

            {/* Detail rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
              {[prog.age, prog.freq, prog.price].map((text) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: prog.color,
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Enroll Now */}
            <button
              onClick={() => scrollToSection('contact')}
              style={{
                marginTop: 22,
                width: '100%',
                padding: '13px 0',
                borderRadius: 10,
                border: 'none',
                backgroundColor: prog.color,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.3px',
              }}
            >
              Enroll Now
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

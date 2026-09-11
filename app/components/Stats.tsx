'use client'
import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { SiteSettings } from '@/lib/site-data'

gsap.registerPlugin(ScrollTrigger)

// Splits a stored value like "500+" or "98%" into a numeric part (for the
// count-up animation) and whatever trailing suffix it had.
function parseStat(raw: string): { value: number; suffix: string } {
  const match = raw.match(/^(\d+)(.*)$/)
  if (!match) return { value: 0, suffix: raw }
  return { value: Number(match[1]), suffix: match[2] }
}

export default function Stats({ settings }: { settings: SiteSettings }) {
  const STATS = useMemo(() => [
    { ...parseStat(settings.players_trained),  label: 'Players Trained'     },
    { ...parseStat(settings.years_excellence), label: 'Years of Excellence' },
    { ...parseStat(settings.academies_count),  label: 'Academies'           },
    { ...parseStat(settings.success_rate),     label: 'Success Rate'        },
  ], [settings])

  const sectionRef  = useRef<HTMLElement>(null)
  const numRefs     = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Number count-up for each stat
      numRefs.current.forEach((el, i) => {
        if (!el) return
        const { value, suffix } = STATS[i]
        const obj = { val: 0 }
        gsap.to(obj, {
          val: value,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate() {
            el.textContent = Math.round(obj.val) + suffix
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [STATS])

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        backgroundColor: 'var(--color-bg)',
        padding: '100px 0',
        width: '100%',
      }}
    >
      {/* Gold label */}
      <p style={{
        textAlign: 'center',
        color: 'var(--color-gold)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '6px',
        textTransform: 'uppercase',
        margin: '0 0 24px',
      }}>
        By The Numbers
      </p>

      {/* Headline */}
      <h2
        style={{
          textAlign: 'center',
          color: 'var(--color-text)',
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 800,
          margin: '0 auto 60px',
          lineHeight: 1.1,
        }}
      >
        Our Legacy Speaks
      </h2>

      {/* Stats grid */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0,
      }}
        className="stats-grid"
      >
        {STATS.map(({ suffix, label }, i) => (
          <div key={label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            borderRight: i < STATS.length - 1 ? '1px solid rgba(var(--color-gold-rgb),0.25)' : 'none',
          }}>
            <span
              ref={el => { numRefs.current[i] = el }}
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: 'var(--color-gold)',
                lineHeight: 1,
                display: 'block',
              }}
            >
              {'0' + suffix}
            </span>
            <span style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--color-text-dim)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginTop: 8,
              textAlign: 'center',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(var(--color-gold-rgb),0.2)',
        margin: '72px 0 56px',
      }} />

      {/* Quote */}
      <p style={{
        textAlign: 'center',
        color: 'var(--color-text)',
        fontSize: 18,
        fontStyle: 'italic',
        opacity: 0.7,
        maxWidth: 600,
        margin: '0 auto',
        padding: '0 24px',
        lineHeight: 1.7,
      }}>
        &ldquo;Mila Academy is not just a place to train — it is a place to become.&rdquo;
      </p>

      {/* Mobile responsive: 2×2 grid */}
      <style>{`
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 40px 0 !important;
          }
          .stats-grid > div {
            border-right: none !important;
          }
          .stats-grid > div:nth-child(1),
          .stats-grid > div:nth-child(2) {
            border-bottom: 1px solid rgba(var(--color-gold-rgb),0.2);
            padding-bottom: 40px;
          }
        }
      `}</style>
    </section>
  )
}

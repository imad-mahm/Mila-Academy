'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// PLACEHOLDER DATA: these figures are illustrative, not verified business
// numbers. Replace with real counts before launch.
const STATS = [
  { value: 500, suffix: '+', label: 'Players Trained'    },
  { value: 8,   suffix: '',  label: 'Years of Excellence' },
  { value: 2,   suffix: '',  label: 'Academies'           },
  { value: 98,  suffix: '%', label: 'Success Rate'        },
]

export default function Stats() {
  const sectionRef  = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const numRefs     = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline clip-path wipe reveal
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      }

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
  }, [])

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

      {/* Headline with clip-path reveal */}
      <h2
        ref={headlineRef}
        style={{
          textAlign: 'center',
          color: '#ffffff',
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 800,
          margin: '0 auto 60px',
          lineHeight: 1.1,
          clipPath: 'inset(0 100% 0 0)',
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
        color: '#ffffff',
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

'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Testimonial } from '@/lib/site-data'

const CARD_GAP = 24

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx,         setIdx]         = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const trackRef              = useRef<HTMLDivElement>(null)
  const idxRef                = useRef(0)
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  // Fewer cards visible at once on narrower viewports (was fixed at 3, cramped on tablet)
  const visible = windowWidth === 0 ? 3 : windowWidth < 700 ? 1 : windowWidth < 1000 ? 2 : 3
  const cardW   = windowWidth === 0 ? 340 : Math.min(340, windowWidth - 64)
  const stride  = cardW + CARD_GAP
  const maxIdx  = Math.max(0, testimonials.length - visible)

  // Direct DOM control of the track transform — avoids React batching issues on wrap
  const moveTo = useCallback((next: number) => {
    const nextOffset = Math.min(next,          maxIdx) * stride
    const currOffset = Math.min(idxRef.current, maxIdx) * stride

    if (trackRef.current) {
      if (nextOffset < currOffset) {
        // Wrapping backward: instant jump, then re-enable transition
        trackRef.current.style.transition = 'none'
        trackRef.current.style.transform  = `translateX(-${nextOffset}px)`
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (trackRef.current)
              trackRef.current.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)'
          })
        )
      } else {
        trackRef.current.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)'
        trackRef.current.style.transform  = `translateX(-${nextOffset}px)`
      }
    }

    idxRef.current = next
    setIdx(next)  // triggers re-render for dots / card borders only
  }, [maxIdx, stride])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (testimonials.length <= visible) return
    timerRef.current = setInterval(() => moveTo((idxRef.current + 1) % testimonials.length), 4000)
  }, [moveTo, testimonials.length, visible])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  if (testimonials.length === 0) return null

  const goPrev = () => { moveTo((idxRef.current - 1 + testimonials.length) % testimonials.length); resetTimer() }
  const goNext = () => { moveTo((idxRef.current + 1)                        % testimonials.length); resetTimer() }

  return (
    <section style={{ backgroundColor: 'var(--color-bg)', padding: '100px 20px' }}>
      {/* Title */}
      <h2 style={{
        textAlign: 'center',
        color: 'var(--color-text)',
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 800,
        margin: '0 0 60px',
        lineHeight: 1.1,
      }}>
        What Families Say
      </h2>

      {/* Carousel wrapper */}
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>

        {/* Prev arrow */}
        <button
          onClick={goPrev}
          aria-label="Previous"
          style={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'var(--color-surface)',
            border: '1px solid rgba(var(--color-gold-rgb),0.35)',
            color: 'var(--color-gold)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            fontSize: 22,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ‹
        </button>

        {/* Clipping viewport */}
        <div style={{ overflow: 'hidden', padding: '4px 0' }}>
          {/* Track — transform is driven directly via ref, not state */}
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              gap: CARD_GAP,
              willChange: 'transform',
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                style={{
                  width: cardW,
                  flexShrink: 0,
                  backgroundColor: 'var(--color-surface)',
                  border: `0.5px solid ${i === idx ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  boxShadow: i === idx ? '0 0 28px rgba(var(--color-gold-rgb),0.14)' : 'none',
                  borderRadius: 16,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {/* Stars */}
                <p style={{ color: 'var(--color-gold)', fontSize: 17, letterSpacing: 3, margin: '0 0 18px' }}>
                  {'★'.repeat(t.rating) + '☆'.repeat(Math.max(0, 5 - t.rating))}
                </p>

                {/* Quote */}
                <p style={{
                  color: 'var(--color-text)',
                  fontSize: 15,
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  margin: '0 0 24px',
                  flex: 1,
                }}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Avatar row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(var(--color-gold-rgb), 0.125)',
                    border: '1.5px solid rgba(var(--color-gold-rgb), 0.33)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gold)',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 14, margin: 0 }}>{t.name}</p>
                    <p style={{ color: 'var(--color-text-faint)', fontSize: 12, margin: '3px 0 0' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={goNext}
          aria-label="Next"
          style={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'var(--color-surface)',
            border: '1px solid rgba(var(--color-gold-rgb),0.35)',
            color: 'var(--color-gold)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            fontSize: 22,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
        {testimonials.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { moveTo(i); resetTimer() }}
            aria-label={`Go to testimonial ${i + 1}`}
            style={{
              width: idx === i ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === i ? 'var(--color-gold)' : 'var(--color-border-soft)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        ))}
      </div>
    </section>
  )
}

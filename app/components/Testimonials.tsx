'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Testimonial } from '@/lib/site-data'

const CARD_GAP = 24

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx,         setIdx]         = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [paused,      setPaused]      = useState(false)
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
  const moveTo = useCallback((raw: number) => {
    // Clamp into the range the track can actually travel. Callers used to wrap
    // modulo `testimonials.length`, but the last `visible - 1` of those indices
    // all resolve to the same maximum offset — so the carousel sat visually
    // frozen for several ticks at the end of every cycle while the dots and the
    // highlighted-card border kept advancing past it.
    const next = Math.max(0, Math.min(raw, maxIdx))

    const nextOffset = next          * stride
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
    if (paused || maxIdx === 0) return
    // Autoplay is motion the user didn't ask for — WCAG 2.2.2 wants it stoppable,
    // and "reduce motion" means don't start it at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timerRef.current = setInterval(() => {
      // Wrap within the travelable range, not the raw testimonial count.
      moveTo(idxRef.current >= maxIdx ? 0 : idxRef.current + 1)
    }, 4000)
  }, [moveTo, maxIdx, paused])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  // A shrinking viewport lowers maxIdx; without this the track can be left
  // parked past the new limit, showing a band of empty space.
  useEffect(() => {
    if (idxRef.current > maxIdx) moveTo(maxIdx)
  }, [maxIdx, moveTo])

  if (testimonials.length === 0) return null

  const goPrev = () => { moveTo(idxRef.current <= 0      ? maxIdx : idxRef.current - 1); resetTimer() }
  const goNext = () => { moveTo(idxRef.current >= maxIdx ? 0      : idxRef.current + 1); resetTimer() }

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

      {/* Carousel wrapper — autoplay pauses while the user is reading a card
          (hover) or tabbing through it (focus), per WCAG 2.2.2. */}
      <div
        style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >

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

      {/* Dot indicators — one per scroll position, not one per testimonial.
          There used to be a dot for every card, so the trailing dots selected
          an offset the track had already reached and appeared to do nothing. */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
        {Array.from({ length: maxIdx + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => { moveTo(i); resetTimer() }}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-current={idx === i}
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

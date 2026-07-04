'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Only show on pointer-fine devices (not touch)
    if (!window.matchMedia('(pointer: fine)').matches) return

    let mouseX = -100, mouseY = -100
    let ringX  = -100, ringY  = -100
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function tick() {
      // Dot follows exactly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
      }
      // Ring lerps behind at ~80ms effective lag
      ringX += (mouseX - ringX) * 0.14
      ringY += (mouseY - ringY) * 0.14
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* 8px gold dot — tracks exactly */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          backgroundColor: '#f5c518',
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform',
        }}
      />
      {/* 32px ring — lags 80ms */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 32, height: 32,
          borderRadius: '50%',
          border: '1px solid rgba(245,197,24,0.45)',
          pointerEvents: 'none',
          zIndex: 999998,
          willChange: 'transform',
        }}
      />
    </>
  )
}

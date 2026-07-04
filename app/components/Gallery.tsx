'use client'
import { useState, useEffect, useCallback } from 'react'

type Category = 'all' | 'football' | 'basketball' | 'events'

const FILTERS: { key: Category; label: string }[] = [
  { key: 'all',        label: 'All'        },
  { key: 'football',   label: 'Football'   },
  { key: 'basketball', label: 'Basketball' },
  { key: 'events',     label: 'Events'     },
]

// PLACEHOLDER DATA: images are random Picsum stock photos and captions are
// generic category labels, not real academy photos or events. Replace ALL_IMAGES
// with real photography + real captions before launch.
const ALL_IMAGES = [
  { id: 1,  seed: 1,  category: 'football'   as Category, caption: 'Football',   h: 280 },
  { id: 2,  seed: 2,  category: 'basketball' as Category, caption: 'Basketball', h: 360 },
  { id: 3,  seed: 3,  category: 'events'     as Category, caption: 'Academy',    h: 300 },
  { id: 4,  seed: 4,  category: 'football'   as Category, caption: 'Football',   h: 240 },
  { id: 5,  seed: 5,  category: 'basketball' as Category, caption: 'Basketball', h: 320 },
  { id: 6,  seed: 6,  category: 'events'     as Category, caption: 'Academy',    h: 380 },
  { id: 7,  seed: 7,  category: 'football'   as Category, caption: 'Football',   h: 310 },
  { id: 8,  seed: 8,  category: 'basketball' as Category, caption: 'Basketball', h: 260 },
  { id: 9,  seed: 9,  category: 'events'     as Category, caption: 'Academy',    h: 340 },
  { id: 10, seed: 10, category: 'football'   as Category, caption: 'Football',   h: 290 },
  { id: 11, seed: 11, category: 'basketball' as Category, caption: 'Basketball', h: 360 },
  { id: 12, seed: 12, category: 'events'     as Category, caption: 'Academy',    h: 270 },
]

export default function Gallery() {
  const [activeTab,    setActiveTab]    = useState<Category>('all')
  const [visible,      setVisible]      = useState(true)
  const [displayed,    setDisplayed]    = useState(ALL_IMAGES)
  const [hoveredId,    setHoveredId]    = useState<number | null>(null)
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null)

  // Keyboard navigation for lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return
      if (e.key === 'Escape')      setLightboxIdx(null)
      if (e.key === 'ArrowRight')  setLightboxIdx(p => (p! + 1) % displayed.length)
      if (e.key === 'ArrowLeft')   setLightboxIdx(p => (p! - 1 + displayed.length) % displayed.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, displayed.length])

  // Lock scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIdx])

  const switchTab = useCallback((tab: Category) => {
    if (tab === activeTab) return
    setLightboxIdx(null)
    setVisible(false)
    setTimeout(() => {
      setActiveTab(tab)
      setDisplayed(tab === 'all' ? ALL_IMAGES : ALL_IMAGES.filter(img => img.category === tab))
      setVisible(true)
    }, 200)
  }, [activeTab])

  const openLightbox = (img: typeof ALL_IMAGES[number]) => {
    const idx = displayed.findIndex(d => d.id === img.id)
    setLightboxIdx(idx)
  }

  const activeLightbox = lightboxIdx !== null ? displayed[lightboxIdx] : null

  return (
    <section id="gallery" style={{ backgroundColor: 'var(--color-bg)', padding: '100px 20px' }}>
      <style>{`
        .gallery-grid { columns: 3; column-gap: 12px; }
        @media (max-width: 1024px) { .gallery-grid { columns: 2; } }
        @media (max-width: 640px)  { .gallery-grid { columns: 1; } }
      `}</style>

      {/* Title */}
      <h2 style={{
        textAlign: 'center',
        color: '#ffffff',
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 800,
        margin: '0 0 48px',
        lineHeight: 1.1,
      }}>
        Our Academy in Action
      </h2>

      {/* Filter tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            style={{
              padding: '9px 22px',
              borderRadius: 50,
              border: `1px solid ${activeTab === key ? 'var(--color-gold)' : '#333'}`,
              backgroundColor: activeTab === key ? 'var(--color-gold)' : 'transparent',
              color: activeTab === key ? '#000' : '#aaa',
              fontSize: 13,
              fontWeight: activeTab === key ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.22s ease',
              letterSpacing: '0.3px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease' }}>
        <div className="gallery-grid">
          {displayed.map(img => (
            <div
              key={img.id}
              onMouseEnter={() => setHoveredId(img.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => openLightbox(img)}
              style={{
                breakInside: 'avoid',
                marginBottom: 12,
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                height: img.h,
              }}
            >
              {/* Image */}
              <img
                src={`https://picsum.photos/seed/${img.seed}/600/400`}
                alt={img.caption}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: hoveredId === img.id ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.45s ease',
                }}
              />

              {/* Dark overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.58)',
                opacity: hoveredId === img.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }} />

              {/* Caption slides up */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '14px 16px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.3px',
                transform: hoveredId === img.id ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.32s ease',
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
              }}>
                {img.caption}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeLightbox && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.96)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'absolute', top: 20, right: 24,
              background: 'none', border: 'none',
              color: '#fff', fontSize: 30, lineHeight: 1,
              cursor: 'pointer', opacity: 0.75, padding: 8,
            }}
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(p => (p! - 1 + displayed.length) % displayed.length) }}
            style={{
              position: 'absolute', left: 20,
              background: 'none', border: 'none',
              color: 'var(--color-gold)', fontSize: 52, lineHeight: 1,
              cursor: 'pointer', padding: '8px 14px', opacity: 0.9,
            }}
          >
            ‹
          </button>

          {/* Image */}
          <img
            src={`https://picsum.photos/seed/${activeLightbox.seed}/1200/800`}
            alt={activeLightbox.caption}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '82vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 10,
              boxShadow: '0 0 60px rgba(0,0,0,0.8)',
            }}
          />

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(p => (p! + 1) % displayed.length) }}
            style={{
              position: 'absolute', right: 20,
              background: 'none', border: 'none',
              color: 'var(--color-gold)', fontSize: 52, lineHeight: 1,
              cursor: 'pointer', padding: '8px 14px', opacity: 0.9,
            }}
          >
            ›
          </button>

          {/* Caption + counter */}
          <div style={{
            position: 'absolute', bottom: 24,
            left: 0, right: 0, textAlign: 'center',
          }}>
            <p style={{ color: '#fff', fontSize: 15, opacity: 0.85, margin: '0 0 4px' }}>
              {activeLightbox.caption}
            </p>
            <p style={{ color: 'var(--color-text-faint)', fontSize: 12, margin: 0 }}>
              {lightboxIdx! + 1} / {displayed.length}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

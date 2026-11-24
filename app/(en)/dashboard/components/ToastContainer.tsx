'use client'

import { useState, useEffect } from 'react'
import { subscribeToasts, type ToastItem } from './toast'

const CFG: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: '#16a34a', border: 'rgba(22,163,74,0.3)',   color: '#fff',    icon: '✓' },
  error:   { bg: '#ef4444', border: 'rgba(239,68,68,0.3)',   color: '#fff',    icon: '✕' },
  info:    { bg: 'var(--bg-card)', border: 'rgba(245,197,24,0.5)',  color: '#f5c518', icon: 'ℹ' },
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes tsIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {items.map(t => {
          const c = CFG[t.type]
          return (
            <div key={t.id} style={{
              backgroundColor: c.bg,
              border: `1px solid ${c.border}`,
              color: c.color,
              padding: '12px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
              minWidth: 260,
              maxWidth: 380,
              animation: 'tsIn 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontWeight: 900, fontSize: 15 }}>{c.icon}</span>
              {t.message}
            </div>
          )
        })}
      </div>
    </>
  )
}

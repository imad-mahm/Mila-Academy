'use client'
import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'mila-theme'

// Navbar (public site) and the dashboard layout each used to keep their own
// `useState` theme copy, seeded from localStorage inside an effect. That meant
// a first render at the wrong theme, a `set-state-in-effect` lint error, and two
// copies that could disagree. One external store instead: the DOM attribute set
// by the blocking script in app/layout.tsx is the single source of truth.

const listeners = new Set<() => void>()

function read(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

let snapshot: Theme = 'dark'

function getSnapshot(): Theme {
  const current = read()
  // useSyncExternalStore requires a referentially stable snapshot between
  // changes; strings compare by value, so caching only guards needless renders.
  if (current !== snapshot) snapshot = current
  return snapshot
}

/** Server render always assumes dark — the same default the blocking script uses. */
function getServerSnapshot(): Theme {
  return 'dark'
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  // Another tab changing the theme should move this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      applyTheme((e.newValue === 'light' ? 'light' : 'dark'), { persist: false })
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

/** Write the theme to the DOM (and, by default, to localStorage) and notify. */
export function applyTheme(next: Theme, { persist = true } = {}): void {
  const html = document.documentElement
  html.setAttribute('data-theme', next)
  // The `dark`/`light` class is what app/layout.tsx's blocking script sets, so
  // keep it in step or the next page load would flash the old theme.
  html.classList.remove('dark', 'light')
  html.classList.add(next)
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, next) } catch {}
  }
  listeners.forEach(l => l())
}

export function toggleTheme(): void {
  applyTheme(read() === 'dark' ? 'light' : 'dark')
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

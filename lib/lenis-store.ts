import type Lenis from 'lenis'

let _instance: Lenis | null = null

/** Pass null on teardown — a destroyed Lenis left in this slot would make
 *  every later scrollToSection() call a no-op. */
export function setLenisInstance(l: Lenis | null): void {
  _instance = l
}

function scrollToTop(): void {
  if (_instance) _instance.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToEl(el: HTMLElement): void {
  if (_instance) _instance.scrollTo(el, { offset: -NAV_HEIGHT })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: 'smooth' })
}

/** Height of the fixed navbar, so scroll targets don't land underneath it. */
export const NAV_HEIGHT = 60

/**
 * Scrolls to the named section.
 *
 * Returns false when that section isn't on the current page — e.g.
 * "About"/"Contact" in the navbar while the visitor is on /football or
 * /basketball, which only render #programs and #enroll. This used to silently
 * scroll to the top of the current page instead, so those nav items looked
 * broken. Callers navigate to the homepage anchor on false.
 */
export function scrollToSection(id: string): boolean {
  if (id === 'top') {
    scrollToTop()
    return true
  }

  const el = document.getElementById(id)
  if (!el) return false

  scrollToEl(el)
  return true
}

/**
 * Scrolls to the section named by the current URL hash, if any.
 * Lenis takes over the scroll position on mount, which cancels the browser's
 * own hash jump — so an inbound `/#contact` needs to be replayed manually.
 */
export function scrollToHash(): void {
  const id = window.location.hash.slice(1)
  if (!id) return
  const el = document.getElementById(id)
  if (el) scrollToEl(el)
}

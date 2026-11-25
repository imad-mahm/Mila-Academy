/** Height of the fixed navbar, so scroll targets don't land underneath it. */
export const NAV_HEIGHT = 60

// Glide for in-page jumps, unless the OS asks for reduced motion.
function behavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: behavior() })
}

function scrollToEl(el: HTMLElement): void {
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: behavior() })
}

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
 * The section may render after the browser's own hash jump, so an inbound
 * `/#contact` is replayed by components/HashScroll.tsx.
 */
export function scrollToHash(): void {
  const id = window.location.hash.slice(1)
  if (!id) return
  const el = document.getElementById(id)
  if (el) scrollToEl(el)
}

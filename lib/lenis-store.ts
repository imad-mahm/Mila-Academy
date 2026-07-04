import type Lenis from 'lenis'

let _instance: Lenis | null = null

export function setLenisInstance(l: Lenis): void {
  _instance = l
}

export function scrollToSection(id: string): void {
  const el = id === 'top' ? null : document.getElementById(id)
  if (_instance) {
    if (el) {
      _instance.scrollTo(el, { offset: -60 })
    } else {
      _instance.scrollTo(0)
    }
  } else {
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

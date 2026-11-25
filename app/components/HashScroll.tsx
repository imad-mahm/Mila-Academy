'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scrollToHash } from '@/lib/scroll'

// The site used Lenis smooth scrolling until 2026-10-31. It eased every wheel
// scroll for about a second after the wheel stopped, ignored the body scroll
// lock of the mobile menu and photo lightbox, and on the dashboard captured
// the wheel so the sidebar could not be scrolled. Scrolling is native now;
// only in-page jumps (navbar, footer, buttons) glide, via lib/scroll.ts.

/**
 * Replays the URL hash after every navigation. This lives in the root layout,
 * which does not remount when the route changes, and the target section may
 * render after the browser's own jump — so arriving at /#contact from the
 * football page would otherwise land at the top of the homepage.
 */
export default function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (!window.location.hash) return
    const t = window.setTimeout(scrollToHash, 120)
    return () => window.clearTimeout(t)
  }, [pathname])

  return null
}

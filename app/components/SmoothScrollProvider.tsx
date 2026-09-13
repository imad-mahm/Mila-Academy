'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setLenisInstance } from '@/lib/lenis-store'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis()
    setLenisInstance(lenis)

    // Without this, GSAP's ScrollTrigger (used by Stats' count-up, etc.)
    // listens for native scroll events while Lenis smooths scrolling
    // independently — the two fall out of sync, and ScrollTrigger's
    // position recalculation shows up as a visible page jump/lag right
    // when a scroll-triggered animation fires.
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

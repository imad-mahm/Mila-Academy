'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { setLenisInstance } from '@/lib/lenis-store'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis()
    setLenisInstance(lenis)

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

import { Geist, Geist_Mono, Archivo, Cairo } from 'next/font/google'

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Display face for headings: a sturdy grotesque with a width axis, set
// condensed and uppercase in the hero so it reads like a team sheet.
export const archivo = Archivo({
  variable: '--font-display',
  subsets: ['latin'],
  axes: ['wdth'],
})

// Arabic pages: Cairo draws Arabic and Latin letters in one consistent style, so
// names like "MFA" or "Mila" sitting inside Arabic sentences don't look foreign.
export const cairo = Cairo({
  variable: '--font-arabic',
  subsets: ['arabic', 'latin'],
  display: 'swap',
})

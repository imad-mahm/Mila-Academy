'use client'
import { createContext, useContext } from 'react'
import type { Lang } from '@/lib/i18n'

// Tells client components which language the page they are on is in, so they
// can pick the right interface text and keep links inside that language.
const LangContext = createContext<Lang>('en')

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export const useLang = (): Lang => useContext(LangContext)

import type { Metadata } from 'next'
import { getSiteContent } from '@/lib/site-data'
import type { Lang } from '@/lib/i18n'

// The public origin, used to turn relative link-preview image paths into
// absolute URLs. A bad value used to throw inside the root layout and take
// down every page — and the likeliest mistake is pasting the Netlify domain
// without "https://", or leaving the variable empty (`??` doesn't catch "").
// So: trim it, supply a missing scheme, and fall back rather than crash the
// whole site over a link-preview URL.
function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) {
    try {
      return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    } catch {
      // fall through to the default
    }
  }
  return new URL('http://localhost:3000')
}

/** Site-wide metadata (title, description, icon, link preview), editable from the dashboard. */
export async function rootMetadata(lang: Lang): Promise<Metadata> {
  const content = await getSiteContent(lang)
  return {
    metadataBase: siteUrl(),
    title: content.site_title,
    description: content.site_description,
    icons: content.favicon ? { icon: content.favicon } : undefined,
    openGraph: {
      locale: lang === 'ar' ? 'ar_LB' : 'en_US',
      ...(content.share_image ? { images: [content.share_image] } : {}),
    },
  }
}

type PagePath = '' | '/football' | '/basketball'

/** Page metadata plus the links that tell search engines the English and Arabic versions belong together. */
export async function pageMetadata(lang: Lang, path: PagePath): Promise<Metadata> {
  const content = await getSiteContent(lang)
  const title = path === '/football' ? content.football_seo_title : path === '/basketball' ? content.basketball_seo_title : content.site_title
  const description = path === '/football' ? content.football_seo_description : path === '/basketball' ? content.basketball_seo_description : content.site_description
  const en = path || '/'
  const ar = `/ar${path}`
  return {
    title,
    description,
    alternates: {
      canonical: lang === 'ar' ? ar : en,
      languages: { en, ar, 'x-default': en },
    },
  }
}

import SmoothScrollProvider from './SmoothScrollProvider'
import { LangProvider } from './LangProvider'
import { geistSans, geistMono, archivo, cairo } from '@/lib/fonts'
import { isRtl, type Lang } from '@/lib/i18n'

// The <html> and <body> for one language. English (including the dashboard) and
// Arabic each have their own root layout so the page arrives with the right
// language and direction already set.
export default function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const rtl = isRtl(lang)
  return (
    <html
      lang={lang}
      dir={rtl ? 'rtl' : 'ltr'}
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${cairo.variable} h-full antialiased dark${rtl ? ' lang-ar' : ''}`}
      suppressHydrationWarning
    >
      {/* Inline script runs before React hydrates — prevents light/dark flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mila-theme')||'dark';document.documentElement.className=document.documentElement.className.replace(/\\b(dark|light)\\b/g,'')+' '+t;document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider lang={lang}>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </LangProvider>
      </body>
    </html>
  )
}

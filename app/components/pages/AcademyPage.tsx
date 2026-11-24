import Navbar from '../Navbar'
import Footer from '../Footer'
import WhatsAppButton from '../WhatsAppButton'
import AcademyLanding from '../AcademyLanding'
import { getPrograms, getSiteContent } from '@/lib/site-data'
import type { Academy } from '@/lib/programs'
import type { Lang } from '@/lib/i18n'

// The /football or /basketball page, in either language.
export default async function AcademyPage({ academy, lang }: { academy: Academy; lang: Lang }) {
  const [content, programs] = await Promise.all([getSiteContent(lang), getPrograms(academy)])
  return (
    <>
      <Navbar content={content} hasGallery={false} />
      <AcademyLanding academy={academy} content={content} programs={programs} lang={lang} />
      <Footer content={content} hasGallery={false} />
      <WhatsAppButton whatsappNumber={content.whatsapp_number} />
    </>
  )
}

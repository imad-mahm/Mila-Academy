import Navbar from '../Navbar'
import Hero from '../Hero'
import Stats from '../Stats'
import Programs from '../Programs'
import Gallery from '../Gallery'
import Testimonials from '../Testimonials'
import Contact from '../Contact'
import Footer from '../Footer'
import WhatsAppButton from '../WhatsAppButton'
import { getFeaturedPrograms, getTestimonials, getGalleryPhotos, getSiteContent } from '@/lib/site-data'
import type { Lang } from '@/lib/i18n'

// The homepage, in either language. The English route (/) and the Arabic route
// (/ar) both render this; only the language changes.
export default async function HomePage({ lang }: { lang: Lang }) {
  const [programs, testimonials, photos, content] = await Promise.all([
    getFeaturedPrograms(),
    getTestimonials(),
    getGalleryPhotos(),
    getSiteContent(lang),
  ])

  return (
    <>
      <Navbar content={content} hasGallery={photos.length > 0} hasPrograms={programs.length > 0} />
      <Hero content={content} lang={lang} />
      <Stats content={content} />
      <Programs programs={programs} content={content} />
      <Gallery photos={photos} content={content} lang={lang} />
      <Testimonials testimonials={testimonials} content={content} />
      <Contact content={content} />
      <Footer content={content} hasGallery={photos.length > 0} hasPrograms={programs.length > 0} />

      <WhatsAppButton whatsappNumber={content.whatsapp_number} />
    </>
  )
}

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Programs from './components/Programs'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import { getPrograms, getTestimonials, getGalleryPhotos, getSiteSettings } from '@/lib/site-data'

export const revalidate = 60 // re-fetch content at most once a minute

export default async function Home() {
  const [programs, testimonials, photos, settings] = await Promise.all([
    getPrograms(),
    getTestimonials(),
    getGalleryPhotos(),
    getSiteSettings(),
  ])

  return (
    <>
      <Navbar hasGallery={photos.length > 0} hasPrograms={programs.length > 0} />
      <Hero />
      <Stats settings={settings} />
      <Programs programs={programs} />
      <Gallery photos={photos} />
      <Testimonials testimonials={testimonials} />
      <Contact settings={settings} />
      <Footer settings={settings} hasGallery={photos.length > 0} hasPrograms={programs.length > 0} />

      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </>
  )
}

import type { Metadata } from 'next'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Programs from './components/Programs'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import { getFeaturedPrograms, getTestimonials, getGalleryPhotos, getSiteContent } from '@/lib/site-data'

// Re-fetch content at most once a minute. Saves from the dashboard also
// revalidate every page immediately (see lib/server/revalidate.ts).
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent()
  return { title: content.site_title, description: content.site_description }
}

export default async function Home() {
  const [programs, testimonials, photos, content] = await Promise.all([
    getFeaturedPrograms(),
    getTestimonials(),
    getGalleryPhotos(),
    getSiteContent(),
  ])

  return (
    <>
      <Navbar content={content} hasGallery={photos.length > 0} hasPrograms={programs.length > 0} />
      <Hero content={content} />
      <Stats content={content} />
      <Programs programs={programs} content={content} />
      <Gallery photos={photos} content={content} />
      <Testimonials testimonials={testimonials} content={content} />
      <Contact content={content} />
      <Footer content={content} hasGallery={photos.length > 0} hasPrograms={programs.length > 0} />

      <WhatsAppButton whatsappNumber={content.whatsapp_number} />
    </>
  )
}

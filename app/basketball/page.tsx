import type { Metadata } from 'next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import AcademyLanding from '../components/AcademyLanding'
import { getPrograms, getSiteContent } from '@/lib/site-data'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent()
  return { title: content.basketball_seo_title, description: content.basketball_seo_description }
}

export default async function BasketballPage() {
  const [content, programs] = await Promise.all([getSiteContent(), getPrograms('basketball')])
  return (
    <>
      <Navbar content={content} hasGallery={false} />
      <AcademyLanding academy="basketball" content={content} programs={programs} />
      <Footer content={content} hasGallery={false} />
      <WhatsAppButton whatsappNumber={content.whatsapp_number} />
    </>
  )
}

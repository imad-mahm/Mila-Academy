import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import AcademyLanding from '../components/AcademyLanding'
import { getSiteSettings } from '@/lib/site-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mila Basket Academy',
  description:
    'Youth basketball training in Baissour, Lebanon — programmes for every age and level, from beginner to pro pathway.',
}

export const revalidate = 60

export default async function BasketballPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <Navbar hasGallery={false} />
      <AcademyLanding academy="basketball" settings={settings} />
      <Footer settings={settings} hasGallery={false} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </>
  )
}

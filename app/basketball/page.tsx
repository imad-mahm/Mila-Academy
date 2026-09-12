import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import AcademyLanding from '../components/AcademyLanding'
import { getSiteSettings } from '@/lib/site-data'

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

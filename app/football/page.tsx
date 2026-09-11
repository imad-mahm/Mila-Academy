import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import AcademyLanding from '../components/AcademyLanding'
import { getSiteSettings } from '@/lib/site-data'

export const revalidate = 60

export default async function FootballPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <Navbar />
      <AcademyLanding academy="football" settings={settings} />
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </>
  )
}

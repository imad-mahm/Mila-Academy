import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import AcademyLanding from '../components/AcademyLanding'

export default function FootballPage() {
  return (
    <>
      <Navbar />
      <AcademyLanding academy="football" />
      <Footer />
      <WhatsAppButton />
    </>
  )
}

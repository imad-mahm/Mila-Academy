import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Programs from './components/Programs'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Programs />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />

      <WhatsAppButton />
    </>
  )
}

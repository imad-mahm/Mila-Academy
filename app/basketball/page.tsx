import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { SITE_CONFIG } from '@/lib/site-config'

export default function BasketballPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#1a0a00] flex flex-col items-center justify-center gap-6 text-white px-6 pt-24 pb-24">
        <p className="text-[#f97316] text-xs font-bold tracking-[4px] uppercase">Mila Basket Academy</p>
        <h1 className="text-4xl md:text-5xl font-black text-center">Program page launching soon</h1>
        <p className="text-white/50 text-center max-w-md">
          Est. 2024 · Baissour. In the meantime, reach out directly and our team will help you get started.
        </p>
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#f97316] text-white font-bold px-7 py-3 rounded-full hover:bg-orange-600 transition-colors"
        >
          Chat on WhatsApp
        </a>
        <Link
          href="/"
          className="text-sm text-white/40 underline underline-offset-4 hover:text-white transition-colors"
        >
          ← Back to Mila Sports
        </Link>
      </main>
      <Footer />
    </>
  )
}

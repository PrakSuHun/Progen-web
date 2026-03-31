import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { NumbersSection } from '@/components/home/NumbersSection'
import { AboutSection } from '@/components/home/AboutSection'
import { ActivitiesSection } from '@/components/home/ActivitiesSection'
import { CtaBanner } from '@/components/home/CtaBanner'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 relative">
      <Navbar />
      <HeroSection />
      <NumbersSection />
      <AboutSection />
      <ActivitiesSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { NumbersSection } from '@/components/home/NumbersSection'
import { CurriculumSection } from '@/components/home/CurriculumSection'
import { CtaBanner } from '@/components/home/CtaBanner'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <NumbersSection />
      <CurriculumSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}

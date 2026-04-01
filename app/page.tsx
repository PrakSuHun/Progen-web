import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { CurriculumSection } from '@/components/home/CurriculumSection'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { CtaBanner } from '@/components/home/CtaBanner'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <CurriculumSection />
      <ReviewsSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}

import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 아카이브',
  description: 'PROGEN 지난 행사 아카이브',
  robots: { index: false, follow: false },
}

const events = [
  {
    title: 'PROGEN 1기 AI툴 클래스',
    date: '2026. 3. 28',
    location: '충남대학교',
    participants: 100,
    desc: '생성형 AI 개념과 핵심 툴(ChatGPT, Gamma, Perplexity 등)을 직접 체험하며 AI 장벽을 허무는 첫 번째 세션. 대전 13개 대학교에서 100명 이상 참여.',
    tags: ['AI', 'ChatGPT', 'Gamma', '실습'],
    highlights: [
      '100명+ 참가자',
      '13개 대학교 참여',
      '만족도 95%',
    ],
  },
]

export default function ArchivePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 md:pt-24">

        {/* Hero */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Archive
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-4">
              PROGEN의 <span className="text-violet-500">발자취</span>
            </h1>
            <p className="text-[#555] text-base md:text-lg max-w-lg">
              우리가 함께 만들어온 순간들을 기록합니다.
            </p>
          </div>
        </section>

        {/* Events */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto space-y-6">
            {events.map((e) => (
              <div key={e.title} className="bg-[#fafafa] border border-[#eee] rounded-2xl overflow-hidden">
                <div className="p-5 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {e.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 bg-violet-50 border border-violet-100 text-violet-500 text-xs font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-black mb-2">{e.title}</h2>
                  <p className="text-[#999] text-sm mb-4">
                    {e.date} · {e.location} · 참여자 {e.participants}명+
                  </p>
                  <p className="text-[#555] text-sm leading-relaxed mb-6">{e.desc}</p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-3">
                    {e.highlights.map((h) => (
                      <div key={h} className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-xl text-sm font-semibold text-[#333]">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Empty state hint */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 md:p-10 text-center">
              <p className="text-violet-600 font-bold text-base mb-2">더 많은 이야기가 쌓이고 있어요</p>
              <p className="text-[#888] text-sm">매달 새로운 행사가 진행됩니다. 다음 기록의 주인공이 되어보세요.</p>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

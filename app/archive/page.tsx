import type { Metadata } from 'next'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'PROGEN - 아카이브',
  description: '지난 행사 기록과 사진을 확인하세요.',
  openGraph: { title: 'PROGEN - 아카이브', description: '지난 행사 기록과 사진을 확인하세요.' },
  robots: { index: false, follow: false },
}

type ArchiveEvent = {
  title: string
  date: string
  location: string
  participants: number
  desc: string
  tags: string[]
  highlights: string[]
  photos: string[]
}

const events: ArchiveEvent[] = [
  {
    title: 'PROGEN 1기 — 시험공부용 AI 클래스',
    date: '2026. 4. 11',
    location: '충남대학교',
    participants: 100,
    desc: '중간고사 기간을 정조준한 AI 가성비 벼락치기. 다글로(강의 녹음→스크립트→요약), NotebookLM(자료 기반 챗봇), ALT, 유니브AI 4가지 툴을 한 번에 익혀 시험공부 시간을 절반으로 단축하는 실습형 세션.',
    tags: ['다글로', 'NotebookLM', 'ALT', '유니브AI', '시험공부'],
    highlights: ['4툴 종합 실습', '대전 13개 대학교 참여', '중간고사 즉시 적용'],
    photos: [],
  },
  {
    title: 'PROGEN 1기 — AI툴 클래스',
    date: '2026. 3. 28',
    location: '충남대학교',
    participants: 80,
    desc: '생성형 AI 개념부터 실전까지. 사이스페이스(논문 근거 보강), NotebookLM(자료 기반 보고서 작성), 피그마, 퍼플렉시티 등 핵심 툴을 직접 체험하며 AI 장벽을 허무는 첫 번째 세션. 팀 실습으로 보고서 한 편을 즉석 완성.',
    tags: ['Scispace', 'NotebookLM', 'Figma', 'Perplexity', '팀 실습'],
    highlights: ['80명 참가', '대전 13개 대학교 참여', '팀 실습 보고서 완성'],
    photos: ['/archive/0328-1.JPG', '/archive/0328-2.JPG'],
  },
]

export default function ArchivePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 md:pt-24">

        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div
              className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase anim-fade-in-up"
            >
              Archive
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-black leading-tight mb-4 anim-fade-in-up"
              style={{ animationDelay: '80ms' }}
            >
              PROGEN의 <span className="text-violet-500">발자취</span>
            </h1>
            <p
              className="text-[#555] text-base md:text-lg max-w-lg anim-fade-in-up"
              style={{ animationDelay: '160ms' }}
            >
              우리가 함께 만들어온 순간들을 기록합니다.
            </p>
          </div>
        </section>

        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto space-y-10">
            {events.map((e, i) => (
              <Reveal key={e.title} delay={i * 100}>
                <div className="bg-[#fafafa] border border-[#eee] rounded-2xl overflow-hidden card-lift">
                  {/* Photos (사진이 있을 때만) */}
                  {e.photos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {e.photos.map((src, idx) => (
                        <div key={idx} className="relative aspect-[4/3] overflow-hidden bg-[#eee]">
                          <Image
                            src={src}
                            alt={`${e.title} 사진 ${idx + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Info */}
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

                    <div className="flex flex-wrap gap-3">
                      {e.highlights.map((h) => (
                        <div key={h} className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-xl text-sm font-semibold text-[#333]">
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 md:p-10 text-center">
                <p className="text-violet-600 font-bold text-base mb-2">더 많은 이야기가 쌓이고 있어요</p>
                <p className="text-[#888] text-sm">매달 새로운 행사가 진행됩니다. 다음 기록의 주인공이 되어보세요.</p>
              </div>
            </Reveal>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

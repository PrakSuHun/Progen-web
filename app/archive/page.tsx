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
    id: 1,
    title: 'PROGEN 1기 AI 자동화 워크샵',
    date: '2026년 4월',
    location: '충남대학교',
    participants: 70,
    description: 'GPT API를 활용한 업무 자동화 실습. 노코드/로우코드 도구로 나만의 AI 에이전트를 만들어보는 세션.',
    tags: ['AI', '자동화', '실습'],
  },
]

export default function ArchivePage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">아카이브</h1>
          <p className="text-slate-400">PROGEN이 걸어온 발자취를 확인하세요.</p>
        </div>

        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">{event.title}</h2>
                  <p className="text-slate-400 text-sm mb-3">
                    {event.date} · {event.location} · 참여자 {event.participants}명
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
                  <div className="flex gap-2 mt-3">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-purple-900/40 text-purple-300 text-xs rounded-full border border-purple-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-24 text-slate-500">
            아직 등록된 아카이브가 없습니다.
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

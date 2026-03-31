import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 세미나',
  description: 'PROGEN 세미나 일정 및 신청',
  robots: { index: false, follow: false },
}

const upcomingSeminars = [
  {
    id: 1,
    title: 'GPT API로 나만의 챗봇 만들기',
    date: '2026년 4월 (예정)',
    speaker: 'PROGEN 테크팀',
    duration: '3시간',
    capacity: 50,
    tags: ['GPT', 'API', '실습'],
    status: 'upcoming' as const,
  },
]

export default function SeminarPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">세미나</h1>
          <p className="text-slate-400">실전 AI·자동화 세미나 일정을 확인하세요.</p>
        </div>

        {/* 예정된 세미나 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">예정된 세미나</h2>
          <div className="space-y-4">
            {upcomingSeminars.map((seminar) => (
              <div
                key={seminar.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded-full border border-purple-700/40">
                        모집 예정
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{seminar.title}</h3>
                    <p className="text-slate-400 text-sm">
                      {seminar.date} · {seminar.speaker} · {seminar.duration} · 정원 {seminar.capacity}명
                    </p>
                    <div className="flex gap-2 mt-3">
                      {seminar.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href="/event-reg"
                      className="inline-block bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
                    >
                      사전 신청
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 강의노트 바로가기 */}
        <div className="bg-gradient-to-r from-slate-800 to-purple-900/30 rounded-xl p-8 border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">세미나 강의노트</h2>
              <p className="text-slate-400 text-sm">지난 세미나 자료를 언제든지 복습하세요.</p>
            </div>
            <Link
              href="/docs"
              className="inline-block border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-all text-sm text-center"
            >
              강의노트 보기
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

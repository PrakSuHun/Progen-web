import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 세미나',
  description: 'PROGEN 세미나 일정 및 신청',
  robots: { index: false, follow: false },
}

const seminars = [
  {
    status: '종료',
    statusColor: 'bg-[#eee] text-[#888]',
    title: 'AI툴 클래스 — 생성형 AI 개론',
    date: '2026. 3. 28 (금)',
    speaker: 'PROGEN 대표 박수훈',
    duration: '2시간',
    capacity: 100,
    tags: ['ChatGPT', 'Gamma', '프롬프트 엔지니어링'],
    desc: '생성형 AI 개념과 핵심 툴 3-4개를 직접 체험하며 AI 장벽을 허무는 첫 번째 세션.',
  },
  {
    status: '모집 중',
    statusColor: 'bg-violet-50 text-violet-600 border border-violet-200',
    title: 'AI로 가성비 벼락치기 — 시험기간 AI 활용',
    date: '2026. 4. 11 (금)',
    speaker: 'PROGEN 테크팀',
    duration: '2시간',
    capacity: 100,
    tags: ['PPT 요약', '논문 정리', '예상문제 생성'],
    desc: 'PPT 요약, 논문 정리, 예상문제 생성 — 중간고사 학점이 달라집니다.',
  },
  {
    status: '예정',
    statusColor: 'bg-[#fafafa] text-[#999] border border-[#eee]',
    title: '자동화 시스템 기초',
    date: '2026. 5. 2 (금)',
    speaker: 'PROGEN 테크팀',
    duration: '2시간',
    capacity: 80,
    tags: ['Make', 'n8n', '노코드'],
    desc: '노코드 툴(Make 등) 활용 자동화 설계 시작. 팀별 프로젝트 킥오프.',
  },
  {
    status: '예정',
    statusColor: 'bg-[#fafafa] text-[#999] border border-[#eee]',
    title: '자동화 시스템 실전',
    date: '2026. 5. 16 (금)',
    speaker: 'PROGEN 테크팀',
    duration: '2시간',
    capacity: 80,
    tags: ['API', 'GPT 연동', '실무'],
    desc: 'API 및 GPT 연동 실무 프로젝트 구현.',
  },
  {
    status: '예정',
    statusColor: 'bg-[#fafafa] text-[#999] border border-[#eee]',
    title: '데모데이 (Demo Day)',
    date: '2026. 5. 30 (금)',
    speaker: '참가 팀 전원',
    duration: '3시간',
    capacity: 80,
    tags: ['발표', '시상', '포트폴리오'],
    desc: '완성된 자동화 포트폴리오 발표 및 우수팀 시상.',
  },
]

export default function SeminarPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 md:pt-24">

        {/* Hero */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Seminar
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-4">
              실전 AI·자동화 <span className="text-violet-500">세미나</span>
            </h1>
            <p className="text-[#555] text-base md:text-lg max-w-lg">
              매달 열리는 실습 중심 세미나. 이론이 아닌 실전을 다룹니다.
            </p>
          </div>
        </section>

        {/* Seminar list */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto space-y-4">
            {seminars.map((s) => (
              <div key={s.title} className="bg-[#fafafa] border border-[#eee] rounded-2xl p-5 md:p-7 hover:border-violet-200 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${s.statusColor}`}>
                        {s.status}
                      </span>
                    </div>
                    <h3 className="text-black font-bold text-lg mb-1">{s.title}</h3>
                    <p className="text-[#666] text-sm mb-3">{s.desc}</p>
                    <p className="text-[#999] text-xs mb-3">
                      {s.date} · {s.speaker} · {s.duration} · 정원 {s.capacity}명
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white border border-[#e0e0e0] text-[#555] text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {s.status === '모집 중' && (
                    <Link
                      href="/event-reg"
                      className="shrink-0 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold rounded-full transition-colors self-start"
                    >
                      사전 신청
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes CTA */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-violet-500 text-white rounded-2xl p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <h2 className="text-xl md:text-2xl font-black mb-1">세미나 강의노트</h2>
                <p className="text-white/70 text-sm">지난 세미나 자료를 언제든지 복습하세요.</p>
              </div>
              <Link
                href="/docs"
                className="shrink-0 px-6 py-3 bg-white text-violet-600 font-bold rounded-full text-sm hover:bg-violet-50 transition-colors text-center"
              >
                강의노트 보기 →
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

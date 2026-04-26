import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Reveal } from '@/components/Reveal'

export const metadata: Metadata = {
  title: 'PROGEN - 세미나',
  description: 'AI·자동화 세미나 일정을 확인하고 사전 신청하세요.',
  openGraph: { title: 'PROGEN - 세미나', description: 'AI·자동화 세미나 일정을 확인하고 사전 신청하세요.' },
  robots: { index: false, follow: false },
}

const seminars = [
  {
    status: '종료', statusColor: 'bg-[#eee] text-[#888]',
    month: '03', title: 'AI툴 클래스 — 대학생 실전 활용',
    date: '2026. 3. 28 (금)', speaker: '대표 박수훈', capacity: 80,
    tags: ['자료 서치', '논문 파악', 'PPT 제작', '보고서 제작'],
    desc: '대학생이 가장 많이 쓰는 4가지 작업을 AI로 한 번에. 자료 서치부터 논문 파악, PPT 제작, 보고서 제작까지 직접 실습으로 익혀 갑니다.',
  },
  {
    status: '종료', statusColor: 'bg-[#eee] text-[#888]',
    month: '04', title: '중간고사 집중 대비 — 시험공부용 AI',
    date: '2026. 4. 11 (금)', speaker: 'PROGEN 테크팀', capacity: 40,
    tags: ['수업 녹음', '시험 키워드 분석', '시험 문제 제작', '벼락치기 요약본'],
    desc: '수업 녹음본 하나로 시험 끝. 녹음에서 핵심 키워드 자동 분석 → 예상 시험 문제 자동 생성 → 벼락치기용 요약본까지 한 번에 만들어 드렸습니다.',
  },
  {
    status: '모집 중', statusColor: 'bg-sky-50 text-sky-600 border border-sky-200',
    month: '05', title: '시간을 돌려받는 — 일상 자동화 시스템',
    date: '2026. 5월 (예정)', speaker: 'PROGEN 테크팀', capacity: 80,
    tags: ['자동 알림', '녹음 → 요약', '노코드'],
    desc: '장학금·공모전·채용 정보 키워드 자동 알림, 수업 녹음본 자동 텍스트화·요약·문제출제.',
  },
  {
    status: '예정', statusColor: 'bg-[#fafafa] text-[#999] border border-[#eee]',
    month: '06', title: 'AI 숏폼과 음악 제작',
    date: '2026. 6월 (예정)', speaker: 'PROGEN 테크팀', capacity: 80,
    tags: ['숏폼', '음악 AI', '수익화'],
    desc: '그날 배우고 즉시 업로드. 자본금 없이 시작하는 나만의 온라인 수익화 채널.',
  },
  {
    status: '예정', statusColor: 'bg-[#fafafa] text-[#999] border border-[#eee]',
    month: '07', title: '나만의 AI 캐릭터 굿즈 제작',
    date: '2026. 7월 (예정)', speaker: 'PROGEN 테크팀', capacity: 80,
    tags: ['캐릭터', '굿즈', '플리마켓'],
    desc: '내 캐릭터 기획부터 굿즈 제작 및 판매까지. 신세계·롯데백화점 플리마켓 입점 협의 완료!',
  },
]

export default function SeminarPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 md:pt-24">

        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div
              className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase anim-fade-in-up"
            >
              Seminar
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-black leading-tight mb-4 anim-fade-in-up"
              style={{ animationDelay: '80ms' }}
            >
              PROGEN 1기 <span className="text-sky-500">세미나 일정</span>
            </h1>
            <p
              className="text-[#555] text-base md:text-lg max-w-lg anim-fade-in-up"
              style={{ animationDelay: '160ms' }}
            >
              매달 1회, 핵심만 압축한 실습 중심 클래스.
            </p>
          </div>
        </section>

        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto space-y-4">
            {seminars.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div className={`bg-[#fafafa] border border-[#eee] rounded-2xl p-5 md:p-7 card-lift hover:border-sky-200 ${s.status === '종료' ? 'opacity-75' : ''}`}>
                  <div className="flex gap-4 md:gap-6">
                    <div className="shrink-0">
                      <div className={`w-14 h-14 rounded-xl text-white flex flex-col items-center justify-center ${s.status === '종료' ? 'bg-[#bbb]' : 'bg-sky-500'}`}>
                        <span className="text-[8px] font-bold tracking-widest uppercase leading-none">MONTH</span>
                        <span className="text-xl font-black leading-none mt-0.5">{s.month}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${s.statusColor}`}>{s.status}</span>
                      </div>
                      <h3 className="text-black font-bold text-base md:text-lg mb-1">{s.title}</h3>
                      <p className="text-[#666] text-sm mb-2">{s.desc}</p>
                      <p className="text-[#aaa] text-xs mb-3">{s.date} · {s.speaker} · 정원 {s.capacity}명</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {s.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-white border border-[#e0e0e0] text-[#555] text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                      {s.status === '모집 중' && (
                        <Link href="/event-reg"
                          className="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/30 text-white text-sm font-bold rounded-full transition-all duration-200">
                          사전 신청 →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

      </div>
      <Footer />
    </main>
  )
}

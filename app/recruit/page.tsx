import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SpotlightBackground } from '@/components/SpotlightBackground'

export const metadata: Metadata = {
  title: 'PROGEN - 운영진 모집',
  description: 'PROGEN 2기 운영진을 모집합니다.',
  openGraph: { title: 'PROGEN - 운영진 모집', description: 'PROGEN 2기 운영진을 모집합니다.' },
  robots: { index: false, follow: false },
}

const roles = [
  {
    title: '기획 운영진',
    tag: 'Planning',
    duties: ['행사 기획 및 진행', '커리큘럼 설계', '파트너 컨택 및 협업'],
    requirements: ['PROGEN 1기 크루 수료', '기획·운영 경험 우대', '커뮤니케이션 능력'],
  },
  {
    title: '테크 운영진',
    tag: 'Tech',
    duties: ['기술 세션 강의 및 실습', '강의 자료 제작', '멘토링 지원'],
    requirements: ['개발 실무 경험 1년+', 'AI/자동화 도구 경험 우대', '강의 경험 우대'],
  },
  {
    title: '마케팅 운영진',
    tag: 'Marketing',
    duties: ['SNS 콘텐츠 기획·제작', '모집 홍보', '브랜딩 관리'],
    requirements: ['SNS 운영 경험', '디자인 기초 가능자 우대', '콘텐츠 감각'],
  },
]

const perks = [
  '리더십 및 조직 운영 경험',
  '이력서에 기재 가능한 운영 경력',
  '운영진 전용 네트워킹',
  '활동 수료증 발급',
]

export default function RecruitPage() {
  return (
    <main className="min-h-screen">
      <SpotlightBackground variant="page">
      <Navbar />

      <div className="pt-20 md:pt-24">

        {/* Hero */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
              Recruit
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-4">
              PROGEN을 함께 만들<br className="hidden md:block" />
              <span className="text-sky-500">운영진</span>을 찾습니다
            </h1>
            <p className="text-[#555] text-base md:text-lg max-w-lg">
              단순한 봉사가 아닌, 진짜 조직을 운영하는 경험. 2기 운영진 모집 안내입니다.
            </p>
          </div>
        </section>

        {/* Roles */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto space-y-4">
            {roles.map((role) => (
              <div key={role.title} className="bg-[#fafafa] border border-[#eee] rounded-2xl p-5 md:p-8 hover:border-sky-200 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 bg-sky-50 border border-sky-100 text-sky-500 text-[10px] font-bold tracking-wider uppercase rounded-full">
                    {role.tag}
                  </span>
                </div>
                <h2 className="text-xl font-black text-black mb-5">{role.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sky-500 text-xs font-bold uppercase tracking-wider mb-3">주요 업무</p>
                    <div className="space-y-2">
                      {role.duties.map((d) => (
                        <div key={d} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                          <p className="text-[#444] text-sm">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[#999] text-xs font-bold uppercase tracking-wider mb-3">지원 자격</p>
                    <div className="space-y-2">
                      {role.requirements.map((r) => (
                        <div key={r} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ccc] mt-1.5 shrink-0" />
                          <p className="text-[#666] text-sm">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Perks */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
              Perks
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-black mb-8">
              운영진이 되면 <span className="text-sky-500">이런 경험</span>을 쌓아요
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {perks.map((p, i) => (
                <div key={p} className="flex items-center gap-4 p-4 md:p-5 bg-[#fafafa] border border-[#eee] rounded-xl">
                  <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 font-black text-xs flex items-center justify-center shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[#333] text-sm font-medium">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-sky-500 text-white rounded-2xl p-6 md:p-10 text-center">
              <h2 className="text-2xl md:text-3xl font-black mb-3">함께 만들어가요</h2>
              <p className="text-white/70 text-sm mb-2">
                운영진 지원은 1기 행사 이후 별도 공지를 통해 진행됩니다.
              </p>
              <p className="text-white/70 text-sm mb-6">
                지금은 먼저 크루로 참여해보세요.
              </p>
              <Link
                href="/apply"
                className="inline-block px-8 py-3.5 bg-white text-sky-600 font-bold rounded-full text-base hover:bg-sky-50 transition-colors"
              >
                1기 크루 지원하기 →
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
      </SpotlightBackground>
    </main>
  )
}

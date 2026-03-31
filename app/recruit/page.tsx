import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 운영진 모집',
  description: 'PROGEN 운영진 모집 안내',
  robots: { index: false, follow: false },
}

const roles = [
  {
    title: '기획 운영진',
    icon: '📋',
    duties: ['행사 기획 및 진행', '커리큘럼 설계', '파트너 컨택'],
    requirements: ['PROGEN 1기 크루 수료', '기획·운영 경험 우대'],
  },
  {
    title: '테크 운영진',
    icon: '💻',
    duties: ['기술 세션 강의', '실습 자료 제작', '멘토링 지원'],
    requirements: ['개발 실무 경험 1년+', 'AI/자동화 도구 경험 우대'],
  },
  {
    title: '마케팅 운영진',
    icon: '📢',
    duties: ['SNS 콘텐츠 제작', '모집 홍보', '브랜딩 관리'],
    requirements: ['SNS 운영 경험', '디자인 기초 가능자 우대'],
  },
]

export default function RecruitPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">운영진 모집</h1>
          <p className="text-slate-400">PROGEN을 함께 만들어갈 운영진을 찾습니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => (
            <div
              key={role.title}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <div className="text-3xl mb-3">{role.icon}</div>
              <h2 className="text-lg font-semibold text-white mb-4">{role.title}</h2>

              <div className="mb-4">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">주요 업무</p>
                <ul className="space-y-1">
                  {role.duties.map((d) => (
                    <li key={d} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">지원 자격</p>
                <ul className="space-y-1">
                  {role.requirements.map((r) => (
                    <li key={r} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="mt-0.5">·</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">함께 만들어가요</h2>
          <p className="text-slate-400 mb-6">
            운영진 지원은 1기 행사 이후 별도 공지를 통해 진행됩니다.<br />
            지금은 먼저 크루로 참여해보세요.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            1기 크루 지원하기
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}

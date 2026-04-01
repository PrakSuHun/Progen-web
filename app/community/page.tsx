import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 커뮤니티',
  description: 'PROGEN 크루 커뮤니티',
  robots: { index: false, follow: false },
}

const channels = [
  {
    title: '자유게시판',
    desc: '크루들과 자유롭게 이야기를 나눠보세요. 일상, 질문, 정보 공유 무엇이든 환영합니다.',
    tag: 'General',
  },
  {
    title: '스터디 모집',
    desc: '함께 공부할 스터디 멤버를 구해보세요. AI, 코딩, 자동화 등 다양한 주제의 스터디가 열리고 있어요.',
    tag: 'Study',
  },
  {
    title: '프로젝트 공유',
    desc: '만들고 있는 프로젝트를 자랑해보세요. 피드백과 협업 기회를 얻을 수 있습니다.',
    tag: 'Project',
  },
  {
    title: '아이디어 피드백',
    desc: '아이디어에 대한 솔직한 피드백을 받아보세요. 혼자 고민하지 말고 함께 발전시켜요.',
    tag: 'Idea',
  },
]

const benefits = [
  '카카오톡 단체 채팅방 — 실시간 소통',
  '세미나 강의노트 무료 제공',
  '현직자 네트워킹 기회',
  '팀 프로젝트 매칭 지원',
  '수료증 발급',
]

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 md:pt-24">

        {/* Hero */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Community
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-4">
              함께 성장하는 <span className="text-violet-500">크루 커뮤니티</span>
            </h1>
            <p className="text-[#555] text-base md:text-lg max-w-lg">
              혼자 공부하지 마세요. 같은 목표를 가진 동료들과 함께하면 성장 속도가 달라집니다.
            </p>
          </div>
        </section>

        {/* Channels */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((ch) => (
                <div key={ch.title} className="p-5 md:p-7 bg-[#fafafa] border border-[#eee] rounded-2xl hover:border-violet-200 transition-colors">
                  <div className="inline-flex items-center mb-4 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[10px] font-bold tracking-wider uppercase">
                    {ch.tag}
                  </div>
                  <h2 className="text-black font-bold text-lg mb-2">{ch.title}</h2>
                  <p className="text-[#666] text-sm leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Crew benefits */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              크루 혜택
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-black mb-8">
              크루가 되면 <span className="text-violet-500">이런 혜택</span>이 있어요
            </h2>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={b} className="flex items-center gap-4 p-4 bg-[#fafafa] border border-[#eee] rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-violet-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[#333] text-sm font-medium">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-violet-500 text-white rounded-2xl p-6 md:p-10 text-center">
              <h2 className="text-2xl md:text-3xl font-black mb-3">아직 크루가 아닌가요?</h2>
              <p className="text-white/70 text-sm mb-6">지금 지원하면 커뮤니티 전체에 접근할 수 있어요.</p>
              <Link
                href="/apply"
                className="inline-block px-8 py-3.5 bg-white text-violet-600 font-bold rounded-full text-base hover:bg-violet-50 transition-colors"
              >
                크루 지원하기 →
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

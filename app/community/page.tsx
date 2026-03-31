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
    icon: '💬',
    name: '자유게시판',
    description: '크루들과 자유롭게 이야기를 나눠보세요.',
    href: '#',
  },
  {
    icon: '📚',
    name: '스터디 모집',
    description: '함께 공부할 스터디 멤버를 구해보세요.',
    href: '#',
  },
  {
    icon: '🔧',
    name: '프로젝트 공유',
    description: '만들고 있는 프로젝트를 자랑해보세요.',
    href: '#',
  },
  {
    icon: '💡',
    name: '아이디어 피드백',
    description: '아이디어에 대한 솔직한 피드백을 받아보세요.',
    href: '#',
  },
]

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">커뮤니티</h1>
          <p className="text-slate-400">PROGEN 크루들과 함께 성장하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {channels.map((ch) => (
            <div
              key={ch.name}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-600 transition-colors"
            >
              <div className="text-3xl mb-3">{ch.icon}</div>
              <h2 className="text-lg font-semibold text-white mb-1">{ch.name}</h2>
              <p className="text-slate-400 text-sm">{ch.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-900/40 to-slate-800 rounded-xl p-8 border border-purple-800/40 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">아직 크루가 아닌가요?</h2>
          <p className="text-slate-400 mb-6">지금 지원하면 커뮤니티 전체에 접근할 수 있어요.</p>
          <Link
            href="/apply"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            크루 지원하기
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}

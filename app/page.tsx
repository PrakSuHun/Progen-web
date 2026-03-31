import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
          PROGEN <span className="text-purple-500">1기</span> 크루 모집
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          프로젝트 기반 커뮤니티의 첫 번째 크루가 되어 함께 성장하세요.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/apply"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            지원하기
          </a>
          <a
            href="#about"
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            자세히 보기
          </a>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="bg-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-500">100+</div>
              <div className="text-slate-400 mt-2">총 신청자</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500">30</div>
              <div className="text-slate-400 mt-2">선발 인원</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500">6개월</div>
              <div className="text-slate-400 mt-2">활동 기간</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">PROGEN에 대해</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">우리는 누구인가</h3>
            <p className="text-slate-300 leading-relaxed">
              PROGEN은 프로젝트 기반의 실전 학습을 제공하는 커뮤니티입니다.
              단순한 강의를 넘어, 실제 프로젝트에 참여하면서 실무 능력을 키우고
              함께 성장하는 경험을 제공합니다.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4">우리의 가치</h3>
            <ul className="text-slate-300 space-y-3">
              <li>✓ 실전 프로젝트 경험</li>
              <li>✓ 멘토링 및 피드백</li>
              <li>✓ 네트워킹 기회</li>
              <li>✓ 지속적인 성장</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

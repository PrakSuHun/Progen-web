'use client'

export function HeroSection() {
  return (
    <section className="min-h-[100svh] flex flex-col justify-center px-5 lg:px-8 pt-14 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-200/30 rounded-full blur-[150px] pointer-events-none anim-blob" />
      <div className="absolute bottom-10 left-[-100px] w-[300px] h-[300px] bg-fuchsia-200/20 rounded-full blur-[140px] pointer-events-none anim-blob" style={{ animationDelay: '-6s' }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-bold anim-fade-in-up"
          style={{ animationDelay: '40ms' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          1기 크루 모집 중
        </div>

        <h1
          className="font-black tracking-tight text-black mb-5 leading-[1.1] anim-fade-in-up"
          style={{ fontSize: 'clamp(2rem, 8vw, 6rem)', animationDelay: '120ms' }}
        >
          AI 시대,<br />
          <span className="text-violet-500">도구를 지배하는</span><br />
          대학생의 커뮤니티.
        </h1>

        <p
          className="text-[#555] text-sm md:text-lg leading-relaxed mb-7 max-w-md anim-fade-in-up"
          style={{ animationDelay: '240ms' }}
        >
          매달 1회, 핵심만 압축한 AI 클래스.<br />
          모든 클래스 필참 X, 원하는 달만 참여해도 OK.
        </p>

        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 anim-fade-in-up"
          style={{ animationDelay: '340ms' }}
        >
          <a
            href="/apply"
            className="px-6 py-3.5 bg-violet-500 text-white font-bold rounded-full text-sm md:text-base text-center hover:bg-violet-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            1기 크루 지원하기
          </a>
          <a
            href="#curriculum"
            className="px-6 py-3.5 bg-white border border-[#e0e0e0] text-[#555] font-medium rounded-full text-sm md:text-base text-center hover:border-violet-300 hover:text-violet-500 hover:-translate-y-0.5 transition-all duration-200"
          >
            커리큘럼 보기 ↓
          </a>
        </div>

        <p className="text-[#aaa] text-xs md:text-sm anim-fade-in-up" style={{ animationDelay: '420ms' }}>
          4월 ~ 7월 · 월 1회 · 참가비 무료
        </p>
      </div>
    </section>
  )
}

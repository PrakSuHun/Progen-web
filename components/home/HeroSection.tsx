'use client'

export function HeroSection() {
  return (
    <section className="min-h-[100svh] flex flex-col justify-center px-5 lg:px-8 pt-14 relative overflow-hidden">
      {/* Violet glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-200/30 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          1기 크루 모집 중
        </div>

        <h1 className="font-black leading-[0.92] tracking-tight text-black mb-5"
          style={{ fontSize: 'clamp(2.4rem, 10vw, 7rem)' }}
        >
          AI 시대,<br />
          <span className="text-violet-500">도구를 지배하는</span><br />
          대학생의 커뮤니티.
        </h1>

        <p className="text-[#555] text-base md:text-lg leading-relaxed mb-8 max-w-md">
          대전 지역 대학생들이 AI를 무기로 만드는 곳.<br />
          함께 배우고, 만들고, 성장합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <a
            href="/apply"
            className="px-7 py-4 bg-violet-500 text-white font-bold rounded-full text-base text-center hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/20"
          >
            1기 크루 지원하기
          </a>
          <a
            href="/about"
            className="px-7 py-4 bg-white border border-[#e0e0e0] text-[#555] font-medium rounded-full text-base text-center hover:border-violet-300 hover:text-violet-500 transition-all"
          >
            PROGEN 알아보기
          </a>
        </div>

        <p className="text-[#aaa] text-sm">
          4월 ~ 7월 · 총 4회차 · 참가비 무료
        </p>
      </div>
    </section>
  )
}

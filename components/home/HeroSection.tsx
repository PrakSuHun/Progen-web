'use client'

export function HeroSection() {
  return (
    <section className="min-h-[100svh] flex flex-col justify-end pb-10 md:pb-20 px-5 lg:px-8 pt-20 relative overflow-hidden">
      {/* Violet gradient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-violet-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 md:mb-12 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          1기 크루 모집 중
        </div>

        {/* Headline */}
        <h1 className="font-black leading-[0.92] tracking-tight text-black mb-5"
          style={{ fontSize: 'clamp(2.4rem, 10vw, 7.5rem)' }}
        >
          AI 시대,<br />
          <span className="text-violet-500">도구를 지배하는</span><br />
          대학생의 커뮤니티.
        </h1>

        <p className="text-[#555] text-base md:text-lg leading-relaxed mb-8 max-w-lg">
          AI로 <span className="text-black font-semibold">'시간'</span>을 벌고,{' '}
          <span className="text-black font-semibold">'진짜 중요한 것'</span>에 투자하세요.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <a
            href="/apply"
            className="px-7 py-4 bg-violet-500 text-white font-bold rounded-full text-base text-center hover:bg-violet-600 transition-all duration-200 shadow-lg shadow-violet-500/20"
          >
            1기 크루 지원하기
          </a>
          <a
            href="#curriculum"
            className="px-7 py-4 bg-white border border-[#e0e0e0] text-[#555] font-medium rounded-full text-base text-center hover:border-violet-300 hover:text-violet-500 transition-all"
          >
            커리큘럼 보기 ↓
          </a>
        </div>

        <p className="text-[#aaa] text-sm">
          4월 ~ 7월 · 총 4회차 · 참가비 무료
        </p>
      </div>
    </section>
  )
}

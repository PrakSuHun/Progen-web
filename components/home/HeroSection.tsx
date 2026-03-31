'use client'

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-end pb-20 px-6 lg:px-8 pt-24 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Very dim violet glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-700/6 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Label */}
        <div className="flex items-center gap-3 mb-14 text-[#444] text-xs tracking-[0.2em] uppercase">
          <span className="w-8 h-px bg-[#2a2a2a]" />
          대전 · 대학생 AI 커뮤니티 · 1기 크루 모집 중
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        </div>

        {/* Main headline */}
        <h1 className="font-black leading-[0.88] tracking-tight text-white mb-14"
          style={{ fontSize: 'clamp(3rem, 9vw, 9rem)' }}
        >
          AI 시대,<br />
          <span className="text-[#2a2a2a]">도구를 지배하는</span><br />
          대학생의 커뮤니티.
        </h1>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 border-t border-[#1a1a1a] pt-10">
          <div className="max-w-md">
            <p className="text-[#666] text-base leading-relaxed">
              우리는 기술 가치보다 통찰에 집중합니다.<br />
              AI로 <span className="text-white font-medium">'시간'</span>을 벌고,{' '}
              <span className="text-white font-medium">'진짜 중요한 것'</span>에 투자하세요.
            </p>
            <p className="text-[#333] text-sm mt-3">
              4월 ~ 7월 · 총 4회차 커리큘럼 · 참가비 무료
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <a
              href="/apply"
              className="px-8 py-4 bg-white text-black font-bold rounded-full text-sm hover:bg-violet-400 hover:text-white transition-all duration-300"
            >
              1기 크루 지원하기
            </a>
            <a
              href="#curriculum"
              className="text-[#555] hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              커리큘럼 보기 <span>↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

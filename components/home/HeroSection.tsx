'use client'

export function HeroSection() {
  return (
    <section className="min-h-[100svh] flex flex-col justify-end pb-12 md:pb-20 px-5 lg:px-8 pt-20 relative overflow-hidden">
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Label */}
        <div className="flex items-center gap-3 mb-10 md:mb-14 text-[#999] text-[11px] tracking-[0.2em] uppercase">
          <span className="w-6 h-px bg-[#ccc]" />
          대전 · 대학생 AI 커뮤니티 · 1기 크루 모집 중
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        </div>

        {/* Main headline */}
        <h1 className="font-black leading-[0.9] tracking-tight text-black mb-10 md:mb-14"
          style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}
        >
          AI 시대,<br />
          <span className="text-[#ccc]">도구를 지배하는</span><br />
          대학생의 커뮤니티.
        </h1>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-t border-[#e0e0e0] pt-8">
          <div className="max-w-md">
            <p className="text-[#555] text-[15px] leading-relaxed">
              우리는 기술 가치보다 통찰에 집중합니다.<br />
              AI로 <span className="text-black font-semibold">'시간'</span>을 벌고,{' '}
              <span className="text-black font-semibold">'진짜 중요한 것'</span>에 투자하세요.
            </p>
            <p className="text-[#aaa] text-sm mt-2">
              4월 ~ 7월 · 총 4회차 커리큘럼 · 참가비 무료
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <a
              href="/apply"
              className="px-7 py-3.5 bg-black text-white font-bold rounded-full text-sm hover:bg-violet-500 transition-all duration-300"
            >
              1기 크루 지원하기
            </a>
            <a
              href="#curriculum"
              className="text-[#999] hover:text-black transition-colors text-sm flex items-center gap-2"
            >
              커리큘럼 보기 <span>↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

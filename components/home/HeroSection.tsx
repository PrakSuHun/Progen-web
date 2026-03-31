'use client'

export function HeroSection() {
  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden text-center">
      {/* 블롭 배경 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* 배지 */}
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
          </span>
          대전 유일무이 대학생 AI 활용 단체 · PROGEN 1기 크루 모집 중
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-10 leading-tight tracking-tight text-white">
          AI 시대<br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            대학생으로 살아남기
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-300 mb-6 font-medium leading-relaxed max-w-4xl mx-auto">
          AI에게 대체될 것인가, AI를 리드할 것인가.<br />
          AI로 <span className="text-white font-bold">&apos;시간&apos;</span>을 벌고{' '}
          <span className="text-white font-bold italic">&apos;진짜 중요한 것&apos;</span>에 투자하는 법
        </p>

        <p className="text-base text-slate-500 mb-12 font-medium">
          4월 ~ 7월 · 총 4회차 커리큘럼 · 참가비 무료
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href="/apply"
            className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black rounded-2xl text-xl hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-2xl shadow-white/10"
          >
            1기 크루 지원하기
          </a>
          <a
            href="#curriculum"
            className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/20 text-white font-bold rounded-2xl text-xl hover:bg-white/10 transition-all"
          >
            커리큘럼 보기
          </a>
        </div>
      </div>
    </section>
  )
}

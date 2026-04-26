'use client'

import { useEffect, useRef } from 'react'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null)

  // 마우스 위치 따라가는 spotlight
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty('--mx', `${x}%`)
      el.style.setProperty('--my', `${y}%`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="min-h-[100svh] flex flex-col justify-center px-5 lg:px-8 pt-14 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at var(--mx, 70%) var(--my, 30%), rgba(167, 139, 250, 0.18), transparent 45%), linear-gradient(180deg, #fbfaff 0%, #ffffff 60%, #faf7ff 100%)',
      }}
    >
      {/* 격자 패턴 */}
      <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" />

      {/* mesh blobs */}
      <div className="absolute -top-20 -right-20 w-[480px] h-[480px] bg-violet-300/30 rounded-full blur-[160px] pointer-events-none anim-blob" />
      <div
        className="absolute bottom-0 left-[-120px] w-[380px] h-[380px] bg-fuchsia-300/25 rounded-full blur-[150px] pointer-events-none anim-blob-2"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-sky-200/25 rounded-full blur-[140px] pointer-events-none anim-blob"
        style={{ animationDelay: '-9s' }}
      />

      {/* 그라데이션 라인 (상단) */}
      <div className="absolute top-14 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
        {/* 좌: 메인 타이틀 */}
        <div>
          <div
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white border border-violet-200 text-violet-600 text-xs font-bold shadow-sm shadow-violet-100 anim-fade-in-up backdrop-blur-sm"
            style={{ animationDelay: '40ms' }}
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-violet-500 anim-ping-slow" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-violet-500" />
            </span>
            1기 크루 모집 중 · 5월 클래스 사전 신청 OPEN
          </div>

          <h1
            className="font-black tracking-tight mb-5 leading-[1.05] anim-fade-in-up"
            style={{ fontSize: 'clamp(2rem, 8vw, 6rem)', animationDelay: '120ms' }}
          >
            <span className="text-black">AI 시대,</span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent anim-gradient-shift">
              도구를 지배하는
            </span>
            <br />
            <span className="text-black">대학생의 커뮤니티.</span>
          </h1>

          <p
            className="text-[#555] text-sm md:text-lg leading-relaxed mb-7 max-w-md anim-fade-in-up"
            style={{ animationDelay: '240ms' }}
          >
            매달 1회, 핵심만 압축한 AI 클래스.
            <br />
            모든 클래스 필참 X, 원하는 달만 참여해도 OK.
          </p>

          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 anim-fade-in-up"
            style={{ animationDelay: '340ms' }}
          >
            <a
              href="/apply"
              className="group relative px-6 py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-full text-sm md:text-base text-center hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-200 shadow-lg shadow-violet-500/20 overflow-hidden"
            >
              <span className="relative z-10">1기 크루 지원하기 →</span>
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
            <a
              href="#curriculum"
              className="px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-[#e0e0e0] text-[#555] font-medium rounded-full text-sm md:text-base text-center hover:border-violet-300 hover:text-violet-500 hover:-translate-y-0.5 transition-all duration-200"
            >
              커리큘럼 보기 ↓
            </a>
          </div>

          <p
            className="text-[#aaa] text-xs md:text-sm anim-fade-in-up"
            style={{ animationDelay: '420ms' }}
          >
            4월 ~ 7월 · 월 1회 · 참가비 무료
          </p>
        </div>

        {/* 우: 떠다니는 미리보기 카드들 (모바일에선 숨김) */}
        <div className="hidden lg:block relative h-[440px]">
          <FloatCard
            top="0%"
            left="10%"
            delay="0s"
            color="from-violet-500 to-fuchsia-500"
            label="3월 종료"
            title="AI툴 클래스"
            sub="80명 참가"
            tags={['논문 파악', 'PPT 제작']}
            tilt="-3deg"
          />
          <FloatCard
            top="22%"
            left="45%"
            delay="-1.5s"
            color="from-violet-500 to-violet-400"
            label="4월 종료"
            title="시험공부용 AI"
            sub="40명 참가"
            tags={['수업 녹음', '벼락치기 요약']}
            tilt="2deg"
          />
          <FloatCard
            top="55%"
            left="5%"
            delay="-3s"
            color="from-fuchsia-500 to-pink-400"
            label="5월 모집중"
            title="일상 자동화"
            sub="사전 신청 OPEN"
            tags={['자동 알림', '노코드']}
            tilt="3deg"
            highlight
          />
          <FloatCard
            top="70%"
            left="50%"
            delay="-2s"
            color="from-sky-400 to-violet-400"
            label="6월 예정"
            title="AI 숏폼·음악"
            sub="온라인 수익화"
            tags={['숏폼', '음악 AI']}
            tilt="-2deg"
          />
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#aaa] text-[10px] tracking-[0.2em] uppercase anim-float">
        <span>Scroll</span>
        <div className="w-px h-5 bg-gradient-to-b from-violet-400 to-transparent" />
      </div>
    </section>
  )
}

type CardProps = {
  top: string
  left: string
  delay: string
  color: string
  label: string
  title: string
  sub: string
  tags: string[]
  tilt: string
  highlight?: boolean
}

function FloatCard({ top, left, delay, color, label, title, sub, tags, tilt, highlight }: CardProps) {
  return (
    <div
      className="absolute anim-float"
      style={{ top, left, animationDelay: delay, transform: `rotate(${tilt})` }}
    >
      <div
        className={`w-[230px] bg-white/90 backdrop-blur-md border rounded-2xl p-4 shadow-xl shadow-violet-200/40 hover:shadow-2xl hover:shadow-violet-300/50 transition-all duration-300 hover:-translate-y-1 ${
          highlight ? 'border-violet-300 ring-2 ring-violet-200/60' : 'border-white'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${color} text-white`}
          >
            {label}
          </span>
          {highlight && (
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          )}
        </div>
        <h4 className="text-black font-black text-sm mb-0.5">{title}</h4>
        <p className="text-[#888] text-[11px] mb-2.5">{sub}</p>
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[10px] font-semibold rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

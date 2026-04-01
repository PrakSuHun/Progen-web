'use client'

import { useEffect, useRef, useState } from 'react'

function Counter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
  { value: '1.4억', label: '대표 누적 매출', note: '2021 — 현재' },
  { value: '1억', label: '정부지원금 유치', note: '청년창업사관학교' },
  { counter: 100, suffix: '+', label: '1회차 참여자', note: '충남대 AI 워크숍' },
  { counter: 95, suffix: '%', label: '참가자 만족도', note: '실제 설문 결과' },
]

export function NumbersSection() {
  return (
    <section className="bg-violet-500 text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`py-7 md:py-10 px-3 md:px-6 ${i < stats.length - 1 ? 'border-r border-white/20' : ''}`}
            >
              <div className="text-2xl md:text-4xl font-black mb-1 tabular-nums">
                {'value' in s ? s.value : <Counter target={s.counter!} suffix={s.suffix} />}
              </div>
              <div className="text-white/90 text-xs md:text-sm font-medium mb-0.5">{s.label}</div>
              <div className="text-white/50 text-[10px] md:text-xs">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

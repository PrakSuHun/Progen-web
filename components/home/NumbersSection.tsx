'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  target: number
  suffix?: string
  duration?: number
}

function Counter({ target, suffix = '', duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
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

  return (
    <div ref={ref} className="text-5xl font-black text-purple-400">
      {count}{suffix}
    </div>
  )
}

export function NumbersSection() {
  return (
    <section className="bg-slate-800/50 border-y border-white/5 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
          <div>
            <div className="text-5xl font-black text-purple-400">1.4억</div>
            <div className="text-slate-400 mt-3 font-medium">대표 누적 매출</div>
          </div>
          <div>
            <div className="text-5xl font-black text-purple-400">1억</div>
            <div className="text-slate-400 mt-3 font-medium">정부지원금 유치</div>
          </div>
          <div>
            <Counter target={100} suffix="명+" />
            <div className="text-slate-400 mt-3 font-medium">1회차 참여자</div>
          </div>
          <div>
            <Counter target={95} suffix="%" />
            <div className="text-slate-400 mt-3 font-medium">참가자 만족도</div>
          </div>
        </div>
      </div>
    </section>
  )
}

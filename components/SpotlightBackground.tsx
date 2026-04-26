'use client'

import { useEffect, useRef, ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** 'hero' = 풀스크린 히어로 (강한 그라데이션), 'page' = 페이지 일반 (옅은 톤) */
  variant?: 'hero' | 'page'
  className?: string
}

export function SpotlightBackground({ children, variant = 'page', className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
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

  const bg =
    variant === 'hero'
      ? 'radial-gradient(circle at var(--mx, 70%) var(--my, 30%), rgba(56, 189, 248, 0.20), transparent 45%), linear-gradient(180deg, #f5fbff 0%, #ffffff 55%, #f0f9ff 100%)'
      : 'radial-gradient(600px circle at var(--mx, 50%) var(--my, 0%), rgba(56, 189, 248, 0.10), transparent 60%), #ffffff'

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ background: bg }}
    >
      {/* 격자 패턴 (옅게) */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

      {/* mesh blob 2개 (옅게, page variant 전용) */}
      {variant === 'page' && (
        <>
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-sky-200/30 rounded-full blur-[140px] pointer-events-none anim-blob" />
          <div
            className="absolute top-1/2 -left-32 w-[360px] h-[360px] bg-blue-200/25 rounded-full blur-[140px] pointer-events-none anim-blob-2"
            style={{ animationDelay: '-6s' }}
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  )
}

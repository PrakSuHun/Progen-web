'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/Logo'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" aria-label="PROGEN 홈" className="relative z-[60] flex items-center">
              <Logo markSize={22} wordmarkHeight={14} gap={6} />
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <Link href="/about" className="text-[#666] hover:text-sky-500 transition-colors text-sm">소개</Link>
              <Link href="/seminar" className="text-[#666] hover:text-sky-500 transition-colors text-sm">세미나</Link>
              <Link href="/archive" className="text-[#666] hover:text-sky-500 transition-colors text-sm">아카이브</Link>
              <Link href="/community" className="text-[#666] hover:text-sky-500 transition-colors text-sm">커뮤니티</Link>
              <Link href="/recruit" className="text-[#666] hover:text-sky-500 transition-colors text-sm">운영진 모집</Link>
            </div>

            <Link
              href="/event-reg"
              className="hidden md:inline-block px-5 py-2 bg-sky-500 text-white font-bold text-sm rounded-full hover:bg-sky-600 transition-all duration-200"
            >
              9월 행사 신청
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-black text-xl leading-none w-10 h-10 flex items-center justify-center relative z-[60]"
              aria-label="메뉴"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[55] bg-white md:hidden">
          <div className="pt-20 px-6 flex flex-col gap-6">
            <Link href="/about" className="text-black text-lg font-semibold" onClick={() => setIsOpen(false)}>소개</Link>
            <Link href="/seminar" className="text-black text-lg font-semibold" onClick={() => setIsOpen(false)}>세미나</Link>
            <Link href="/archive" className="text-black text-lg font-semibold" onClick={() => setIsOpen(false)}>아카이브</Link>
            <Link href="/community" className="text-black text-lg font-semibold" onClick={() => setIsOpen(false)}>커뮤니티</Link>
            <Link href="/recruit" className="text-black text-lg font-semibold" onClick={() => setIsOpen(false)}>운영진 모집</Link>
            <div className="pt-4 border-t border-[#eee]">
              <Link
                href="/event-reg"
                className="block text-center py-3.5 bg-sky-500 text-white font-bold text-base rounded-full"
                onClick={() => setIsOpen(false)}
              >
                9월 행사 사전 신청
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

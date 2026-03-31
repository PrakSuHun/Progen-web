'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#1a1a1a]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-white font-black text-xl tracking-tight">
            PRO<span className="text-violet-400">GEN</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-[#888] hover:text-white transition-colors text-sm">소개</Link>
            <Link href="/seminar" className="text-[#888] hover:text-white transition-colors text-sm">세미나</Link>
            <Link href="/archive" className="text-[#888] hover:text-white transition-colors text-sm">아카이브</Link>
            <Link href="/community" className="text-[#888] hover:text-white transition-colors text-sm">커뮤니티</Link>
            <Link href="/recruit" className="text-[#888] hover:text-white transition-colors text-sm">운영진 모집</Link>
          </div>

          <Link
            href="/apply"
            className="hidden md:inline-block px-5 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-violet-400 hover:text-white transition-all duration-200"
          >
            지원하기
          </Link>

          {/* Mobile button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white text-xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="메뉴"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-[#1a1a1a] flex flex-col gap-5">
            <Link href="/about" className="text-[#888] hover:text-white transition-colors text-sm" onClick={() => setIsOpen(false)}>소개</Link>
            <Link href="/seminar" className="text-[#888] hover:text-white transition-colors text-sm" onClick={() => setIsOpen(false)}>세미나</Link>
            <Link href="/archive" className="text-[#888] hover:text-white transition-colors text-sm" onClick={() => setIsOpen(false)}>아카이브</Link>
            <Link href="/community" className="text-[#888] hover:text-white transition-colors text-sm" onClick={() => setIsOpen(false)}>커뮤니티</Link>
            <Link href="/recruit" className="text-[#888] hover:text-white transition-colors text-sm" onClick={() => setIsOpen(false)}>운영진 모집</Link>
            <Link
              href="/apply"
              className="mt-2 inline-block px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full w-fit"
              onClick={() => setIsOpen(false)}
            >
              지원하기
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

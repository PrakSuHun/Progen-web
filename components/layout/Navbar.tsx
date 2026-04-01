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
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-[#eee]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-black font-black text-lg tracking-tight">
            PRO<span className="text-violet-500">GEN</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link href="/about" className="text-[#888] hover:text-black transition-colors text-sm">소개</Link>
            <Link href="/seminar" className="text-[#888] hover:text-black transition-colors text-sm">세미나</Link>
            <Link href="/archive" className="text-[#888] hover:text-black transition-colors text-sm">아카이브</Link>
            <Link href="/community" className="text-[#888] hover:text-black transition-colors text-sm">커뮤니티</Link>
            <Link href="/recruit" className="text-[#888] hover:text-black transition-colors text-sm">운영진 모집</Link>
          </div>

          <Link
            href="/apply"
            className="hidden md:inline-block px-5 py-2 bg-black text-white font-bold text-sm rounded-full hover:bg-violet-500 transition-all duration-200"
          >
            지원하기
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black text-xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="메뉴"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-6 border-t border-[#eee] flex flex-col gap-5">
            <Link href="/about" className="text-[#555] hover:text-black transition-colors text-sm" onClick={() => setIsOpen(false)}>소개</Link>
            <Link href="/seminar" className="text-[#555] hover:text-black transition-colors text-sm" onClick={() => setIsOpen(false)}>세미나</Link>
            <Link href="/archive" className="text-[#555] hover:text-black transition-colors text-sm" onClick={() => setIsOpen(false)}>아카이브</Link>
            <Link href="/community" className="text-[#555] hover:text-black transition-colors text-sm" onClick={() => setIsOpen(false)}>커뮤니티</Link>
            <Link href="/recruit" className="text-[#555] hover:text-black transition-colors text-sm" onClick={() => setIsOpen(false)}>운영진 모집</Link>
            <Link
              href="/apply"
              className="mt-2 inline-block px-6 py-2.5 bg-black text-white font-bold text-sm rounded-full w-fit"
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

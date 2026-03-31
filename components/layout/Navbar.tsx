'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-500">PROGEN</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link href="/" className="text-slate-300 hover:text-white transition">홈</Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition">소개</Link>
            <Link href="/seminar" className="text-slate-300 hover:text-white transition">세미나</Link>
            <Link href="/archive" className="text-slate-300 hover:text-white transition">아카이브</Link>
            <Link href="/community" className="text-slate-300 hover:text-white transition">커뮤니티</Link>
            <Link href="/recruit" className="text-slate-300 hover:text-white transition">운영진 모집</Link>
            <Link
              href="/apply"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg transition font-medium"
            >
              지원하기
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/" className="text-slate-300 hover:text-white transition block" onClick={() => setIsOpen(false)}>홈</Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition block" onClick={() => setIsOpen(false)}>소개</Link>
            <Link href="/seminar" className="text-slate-300 hover:text-white transition block" onClick={() => setIsOpen(false)}>세미나</Link>
            <Link href="/archive" className="text-slate-300 hover:text-white transition block" onClick={() => setIsOpen(false)}>아카이브</Link>
            <Link href="/community" className="text-slate-300 hover:text-white transition block" onClick={() => setIsOpen(false)}>커뮤니티</Link>
            <Link href="/recruit" className="text-slate-300 hover:text-white transition block" onClick={() => setIsOpen(false)}>운영진 모집</Link>
            <Link href="/apply" className="text-purple-400 hover:text-purple-300 transition block font-medium" onClick={() => setIsOpen(false)}>지원하기</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

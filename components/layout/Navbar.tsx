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
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition"
            >
              홈
            </Link>
            <Link
              href="/about"
              className="text-slate-300 hover:text-white transition"
            >
              소개
            </Link>
            <Link
              href="/apply"
              className="text-slate-300 hover:text-white transition"
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
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition block"
            >
              홈
            </Link>
            <Link
              href="/about"
              className="text-slate-300 hover:text-white transition block"
            >
              소개
            </Link>
            <Link
              href="/apply"
              className="text-slate-300 hover:text-white transition block"
            >
              지원하기
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

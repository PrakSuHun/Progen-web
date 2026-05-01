'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SpotlightBackground } from '@/components/SpotlightBackground'

export default function EventRegPage() {
  return (
    <main className="min-h-screen">
      <SpotlightBackground variant="page">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-4 sm:px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-4 md:mb-5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
            Event Registration
          </div>
          <h1 className="text-[26px] sm:text-3xl md:text-4xl font-black text-black mb-2 break-keep">행사 사전 신청</h1>
          <p className="text-[#888] text-sm mb-6 md:mb-8 break-keep">신청 유형을 선택해주세요</p>

          <div className="grid gap-3 md:gap-4">
            <Link
              href="/event-reg/crew"
              className="block bg-white border border-[#eee] rounded-2xl p-4 md:p-7 hover:border-sky-300 hover:shadow-md transition group"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sky-500 text-white font-black text-lg md:text-xl flex items-center justify-center shrink-0">
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base md:text-lg font-black text-black mb-1 group-hover:text-sky-600 transition break-keep">크루로 신청</h2>
                  <p className="text-[#666] text-[13px] md:text-sm mb-1.5 break-keep">PROGEN 1기 크루 (이미 지원 완료한 분)</p>
                  <p className="text-[#aaa] text-[11px] md:text-xs break-keep">이름 · 연락처만 입력하면 끝</p>
                </div>
                <span className="text-sky-500 text-lg md:text-xl shrink-0 self-center group-hover:translate-x-1 transition">→</span>
              </div>
            </Link>

            <Link
              href="/event-reg/guest"
              className="block bg-white border border-[#eee] rounded-2xl p-4 md:p-7 hover:border-sky-300 hover:shadow-md transition group"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#f0f0f0] text-[#333] font-black text-lg md:text-xl flex items-center justify-center shrink-0 border border-[#e0e0e0]">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base md:text-lg font-black text-black mb-1 group-hover:text-sky-600 transition break-keep">비회원(게스트)로 신청</h2>
                  <p className="text-[#666] text-[13px] md:text-sm mb-1.5 break-keep">크루가 아닌 일반 참가자</p>
                  <p className="text-[#aaa] text-[11px] md:text-xs mb-1.5 break-keep">기본 정보 8개 항목 입력</p>
                  <p className="inline-block text-[10px] md:text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 break-keep leading-tight">
                    보증금 5,000원 · 참석 시 전액 환불
                  </p>
                </div>
                <span className="text-sky-500 text-lg md:text-xl shrink-0 self-center group-hover:translate-x-1 transition">→</span>
              </div>
            </Link>
          </div>

          <p className="text-center text-[#aaa] text-xs mt-6 md:mt-8 break-keep">
            크루 지원이 처음이라면 <Link href="/apply" className="text-sky-500 hover:text-sky-600 underline">크루 지원하기</Link>
          </p>
        </div>
      </div>
      <Footer />
      </SpotlightBackground>
    </main>
  )
}

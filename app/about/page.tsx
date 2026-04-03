import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 소개',
  description: 'PROGEN 소개 - 대전 대학생 AI 활용 커뮤니티',
}

const founderTags = [
  '충남대 자율운항시스템공학과 4학년',
  '인스피릿(Inspirit) 대표이사',
  '누적 매출 1.5억',
  '정부지원금 1.2억 유치',
  '골드칼라 공학도상',
  '청년창업사관학교 졸업',
]

const values = [
  { num: '01', title: '실행 > 이론', desc: '우리는 "일단 해보자"를 가장 중요하게 생각합니다. 완벽한 준비보다 빠른 실행이 더 많은 것을 알려줍니다.' },
  { num: '02', title: '도구 활용 = 생존력', desc: 'AI를 전공할 필요는 없습니다. AI를 도구로 활용해 나의 문제를 해결할 수 있으면 됩니다.' },
  { num: '03', title: '함께 > 혼자', desc: '혼자 공부하면 빠르지만, 함께하면 멀리 갑니다. 동료와의 실험이 가장 강력한 성장 엔진입니다.' },
]

const stats = [
  { value: '1.5억', label: '대표 누적 매출' },
  { value: '1.2억', label: '정부지원금 유치' },
  { value: '100+', label: '1회차 참여자' },
  { value: '95%', label: '참가자 만족도' },
]


export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 md:pt-24">

        {/* Hero */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              About PROGEN
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-5">
              왜 PROGEN을<br />
              <span className="text-violet-500">만들었는가</span>
            </h1>
            <p className="text-[#555] text-base md:text-lg leading-relaxed max-w-xl">
              AI가 모든 산업을 바꾸고 있지만, 대전 지역 대학생들에겐 이를 체험할 기회가 부족했습니다.
              PROGEN은 그 간극을 메우기 위해 탄생했습니다 — AI를 단순한 지식이 아닌, 나의 경쟁력을 높이는 실전 무기로 만드는 곳.
            </p>
          </div>
        </section>

        {/* 단체 이념 */}
        <section className="px-5 lg:px-8 py-16 md:py-24 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Philosophy
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-10">
              PROGEN의 <span className="text-violet-500">핵심 가치</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {values.map((v) => (
                <div key={v.num} className="p-5 md:p-7 bg-white border border-[#eee] rounded-2xl hover:border-violet-200 transition-colors">
                  <span className="inline-flex w-8 h-8 rounded-lg bg-violet-500 text-white font-black text-xs items-center justify-center mb-4">{v.num}</span>
                  <h3 className="text-black font-bold text-base mb-2">{v.title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-violet-500 text-white rounded-2xl p-6 md:p-10">
              <div className="text-white/60 text-[11px] font-bold tracking-wider uppercase mb-4">운영 철학</div>
              <blockquote className="text-xl md:text-2xl font-black leading-snug">
                &ldquo;우리는 AI 전문가 집단이 아닙니다.<br />
                AI 도구를 활용해 문제를 해결하는 &lsquo;플랫폼&rsquo;입니다.&rdquo;
              </blockquote>
            </div>
          </div>
        </section>

        {/* 대표 소개 */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Founder
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-10">
              <span className="text-violet-500">대표</span> 소개
            </h2>

            <div className="rounded-2xl bg-[#fafafa] border border-[#eee] p-5 md:p-10 mb-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="shrink-0 flex items-start gap-4 md:flex-col">
                  <div className="w-14 h-14 rounded-xl bg-violet-500 flex items-center justify-center text-xl font-black text-white">
                    박
                  </div>
                  <div>
                    <p className="text-black font-black text-base">박수훈</p>
                    <p className="text-[#999] text-xs mt-0.5">Founder &amp; President</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {founderTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-[#e0e0e0] text-[#555] text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                  <blockquote className="text-[#444] text-sm leading-[1.8]">
                    &ldquo;저 역시 여러분과 똑같은 캠퍼스에서 내일을 고민하는 4학년 대학생입니다.
                    2021년 창업 이후 1.5억 원의 누적 매출과 1.2억 원의 지원금을 유치하며 깨달은 것은,
                    결국 <span className="text-violet-600 font-semibold">&lsquo;실행력&rsquo;과 &lsquo;도구의 활용&rsquo;</span>이 생존의 핵심이라는 점이었습니다.
                    제가 먼저 겪은 시행착오와 노하우를 아낌없이 나누려 합니다.&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-violet-500 text-white rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {stats.map((s, i) => (
                  <div key={i} className={`py-7 md:py-10 px-4 md:px-6 ${i < stats.length - 1 ? 'border-r border-white/20' : ''}`}>
                    <div className="text-2xl md:text-4xl font-black mb-1">{s.value}</div>
                    <div className="text-white/80 text-xs md:text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-4">
              함께 <span className="text-violet-500">시작</span>할 준비 되셨나요?
            </h2>
            <p className="text-[#666] text-base mb-8">무료 · 전공 무관 · 대전 소재 대학생 누구나</p>
            <Link href="/apply"
              className="inline-block px-8 py-4 bg-violet-500 text-white font-bold rounded-full text-base hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/20">
              1기 크루 지원하기 →
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

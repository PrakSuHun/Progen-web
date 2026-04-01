import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PROGEN - 소개',
  description: 'PROGEN 소개 - 대전 대학생 AI 활용 커뮤니티',
}

const missions = [
  { num: '01', title: 'AI 생존 전략', desc: '모든 일자리가 위협받는 시대, AI에게 대체되는 것이 아니라 AI를 다루는 법을 배웁니다.' },
  { num: '02', title: '지역 기반 혁신', desc: '대전 지역 대학생들이 모여 지역 사회와 기업의 문제를 AI로 직접 해결합니다.' },
  { num: '03', title: '실전형 스펙', desc: '단순 학습을 넘어, 이력서에 바로 쓸 수 있는 프로젝트 결과물을 만듭니다.' },
]

const founderTags = [
  '충남대 자율운항시스템공학과 4학년',
  '인스피릿(Inspirit) 대표이사',
  '누적 매출 1.4억',
  '정부지원금 1억 유치',
  '골드칼라 공학도상',
  '청년창업사관학교 졸업',
]

const stats = [
  { value: '1.4억', label: '대표 누적 매출' },
  { value: '1억', label: '정부지원금 유치' },
  { value: '100+', label: '1회차 참여자' },
  { value: '95%', label: '참가자 만족도' },
]

const forWho = [
  'AI를 배우고 싶지만 어디서부터 시작해야 할지 막막한 대학생',
  'ChatGPT를 써봤지만 원하는 답변을 못 얻고 시간만 낭비한 분',
  '나만의 실전 프로젝트를 만들어 이력서에 남기고 싶은 분',
  '단순한 강의가 아니라 함께 성장할 동료와 네트워크를 원하는 분',
]

const features = [
  { title: '실전 프로젝트', desc: '이론 학습을 넘어 실제 프로젝트에 참여하며 실무 경험을 쌓아보세요.' },
  { title: '전문가 멘토링', desc: '경험 많은 멘토들의 피드백과 지도를 통해 더 빠르게 성장하세요.' },
  { title: '네트워킹', desc: '같은 꿈을 가진 대학생들과 만나 네트워크를 확장하세요.' },
  { title: '커뮤니티', desc: '함께 성장하는 커뮤니티 문화 속에서 지속적인 동기부여를 얻으세요.' },
]

const reviews = [
  {
    text: '평소 전공 논문 읽는 게 너무 두려웠는데, 워크숍에서 배운 AI 요약 기법 덕분에 이제는 30분이면 핵심을 다 파악합니다.',
    name: '김*현', school: '충남대학교', major: '경영학부',
  },
  {
    text: '디자인 감각이 전혀 없는 똥손이라 매번 팀플 PPT 담당 피하기 바빴습니다. Gamma와 AI 이미지 생성 툴을 배운 후에는 제가 먼저 디자인을 맡겠다고 나설 정도입니다!',
    name: '이*진', school: '충남대학교', major: '컴퓨터융합학부',
  },
  {
    text: '대학생의 실제 과제와 시험 공부에 특화된 프롬프트를 짜주셔서 당장 다음 주 중간고사에 적용할 생각에 설렙니다.',
    name: '박*우', school: '충남대학교', major: '사회과학대학',
  },
]

const timeline = [
  { month: '3월', event: '크루 모집 & AI 특강' },
  { month: '4월', event: '시험기간 AI 활용 워크숍' },
  { month: '5월', event: '자동화 프로젝트 & 데모데이' },
  { month: '6월', event: 'AI 콘텐츠 제작 (영상/음악)' },
  { month: '7월', event: '실전 마켓 & 백화점 플리마켓' },
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
            <h1 className="text-4xl md:text-6xl font-black text-black leading-tight mb-5">
              AI 시대를 생존하는<br />
              <span className="text-violet-500">가장 확실한 방법</span>
            </h1>
            <p className="text-[#555] text-base md:text-lg leading-relaxed max-w-xl">
              대전 지역 대학생 혁신 네트워크 PROGEN은
              AI 기술을 단순한 지식이 아닌, 나의 경쟁력을 높이는 실전 무기로 만듭니다.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-violet-500 text-white">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className={`py-7 md:py-10 px-3 md:px-6 ${i < stats.length - 1 ? 'border-r border-white/20' : ''}`}>
                <div className="text-2xl md:text-4xl font-black mb-1">{s.value}</div>
                <div className="text-white/80 text-xs md:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-10">
              우리가 <span className="text-violet-500">존재하는 이유</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {missions.map((m) => (
                <div key={m.num} className="p-5 md:p-7 rounded-2xl bg-[#fafafa] border border-[#eee] hover:border-violet-200 transition-colors">
                  <span className="inline-flex w-8 h-8 rounded-lg bg-violet-500 text-white font-black text-xs items-center justify-center mb-4">{m.num}</span>
                  <h3 className="text-black font-bold text-base mb-2">{m.title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-5 lg:px-8 py-16 md:py-24 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-10">
              PROGEN의 <span className="text-violet-500">4가지 특징</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div key={f.title} className="flex gap-4 p-5 md:p-6 bg-white border border-[#eee] rounded-2xl hover:border-violet-200 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 font-black text-sm flex items-center justify-center shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-black font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Founder
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-10">
              <span className="text-violet-500">대표</span> 소개
            </h2>
            <div className="rounded-2xl bg-[#fafafa] border border-[#eee] p-5 md:p-10">
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
                      <span key={tag} className="px-2.5 py-1 bg-white border border-[#e0e0e0] text-[#555] text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <blockquote className="text-[#444] text-sm leading-[1.8]">
                    &ldquo;저 역시 여러분과 똑같은 캠퍼스에서 내일을 고민하는 4학년 대학생입니다.
                    2021년 창업 이후 1.4억 원의 누적 매출과 1억 원의 지원금을 유치하며 깨달은 것은,
                    결국 <span className="text-violet-600 font-semibold">&lsquo;실행력&rsquo;과 &lsquo;도구의 활용&rsquo;</span>이 생존의 핵심이라는 점이었습니다.
                    제가 먼저 겪은 시행착오와 노하우를 아낌없이 나누려 합니다.&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-5 lg:px-8 py-16 md:py-24 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              1기 일정
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-10">
              2026 <span className="text-violet-500">로드맵</span>
            </h2>
            <div className="space-y-0">
              {timeline.map((t, i) => (
                <div key={t.month} className="flex items-center gap-5 py-4 border-t border-[#e0e0e0] last:border-b">
                  <span className="w-12 text-violet-500 font-black text-sm shrink-0">{t.month}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0 ring-4 ring-violet-100" />
                  <p className="text-[#333] text-sm font-medium">{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For who */}
        <section className="px-5 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Who is this for?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-8">
              이런 분들께 <span className="text-violet-500">추천해요</span>
            </h2>
            <div className="space-y-3">
              {forWho.map((text, i) => (
                <div key={i} className="flex items-start gap-4 p-4 md:p-5 rounded-xl bg-[#fafafa] border border-[#eee]">
                  <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[#444] text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="px-5 lg:px-8 py-16 md:py-24 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
              Reviews
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-3">
              참가자 <span className="text-violet-500">생생 후기</span>
            </h2>
            <p className="text-[#777] text-sm mb-10">CNU AI 워크숍 실제 참가자 후기</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((r) => (
                <div key={r.name} className="p-5 md:p-7 bg-white border border-[#eee] rounded-2xl flex flex-col justify-between hover:border-violet-200 transition-colors">
                  <div>
                    <div className="text-violet-400 text-xs tracking-wider mb-4">★ ★ ★ ★ ★</div>
                    <p className="text-[#444] text-sm leading-[1.8] mb-6">&ldquo;{r.text}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#eee]">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-black text-violet-600 shrink-0">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-black text-sm font-bold">{r.name} · {r.school}</p>
                      <p className="text-[#999] text-xs">{r.major}</p>
                    </div>
                  </div>
                </div>
              ))}
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
            <Link
              href="/apply"
              className="inline-block px-8 py-4 bg-violet-500 text-white font-bold rounded-full text-base hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/20"
            >
              1기 크루 지원하기 →
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}

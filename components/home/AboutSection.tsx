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

const forWho = [
  'AI를 배우고 싶지만 어디서부터 시작해야 할지 막막한 대학생',
  'ChatGPT를 써봤지만 원하는 답변을 못 얻고 시간만 낭비한 분',
  '나만의 실전 프로젝트를 만들어 이력서에 남기고 싶은 분',
  '단순한 강의가 아니라 함께 성장할 동료와 네트워크를 원하는 분',
]

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-28 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
          What is PROGEN?
        </div>

        {/* Header */}
        <div className="mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-black leading-tight mb-4">
            AI 시대를 생존하는<br />
            <span className="text-violet-500">가장 확실한 방법</span>
          </h2>
          <p className="text-[#555] text-base md:text-lg leading-relaxed max-w-xl">
            대전 지역 대학생 혁신 네트워크 PROGEN은
            AI 기술을 단순한 지식이 아닌, 나의 경쟁력을 높이는 실전 무기로 만듭니다.
          </p>
        </div>

        {/* Mission cards — stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 md:mb-24">
          {missions.map((m) => (
            <div key={m.num} className="p-5 md:p-7 rounded-2xl bg-[#fafafa] border border-[#eee] hover:border-violet-200 transition-colors">
              <span className="inline-block w-8 h-8 rounded-lg bg-violet-500 text-white font-black text-xs flex items-center justify-center mb-4">{m.num}</span>
              <h3 className="text-black font-bold text-base mb-2">{m.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Founder */}
        <div className="rounded-2xl bg-[#fafafa] border border-[#eee] p-5 md:p-10 mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Founder
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="shrink-0 flex items-start gap-4 md:flex-col">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-violet-500 flex items-center justify-center text-lg md:text-xl font-black text-white">
                박
              </div>
              <div>
                <p className="text-black font-black text-sm">박수훈</p>
                <p className="text-[#999] text-xs mt-0.5">Founder &amp; President</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5 mb-4">
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

        {/* For who */}
        <div>
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Who is this for?
          </div>
          <h3 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">
            이런 분들께 추천해요
          </h3>
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

      </div>
    </section>
  )
}

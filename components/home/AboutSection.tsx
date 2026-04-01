const missions = [
  {
    num: '01',
    title: 'AI 생존 전략',
    desc: '모든 일자리가 위협받는 시대, AI에게 대체되는 것이 아니라 AI를 다루는 법을 배웁니다.',
  },
  {
    num: '02',
    title: '지역 기반 혁신',
    desc: '대전 지역 대학생들이 모여 지역 사회와 기업의 문제를 AI로 직접 해결합니다.',
  },
  {
    num: '03',
    title: '실전형 스펙',
    desc: '단순 학습을 넘어, 이력서에 바로 쓸 수 있는 프로젝트 결과물을 만듭니다.',
  },
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
    <section id="about" className="py-32 px-6 lg:px-8 border-t border-[#222]">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 text-[#666] text-xs tracking-[0.2em] uppercase mb-20">
          <span className="w-8 h-px bg-[#333]" />
          What is PROGEN?
        </div>

        {/* Two column header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.0] mb-8">
              AI 시대를<br />
              생존하는<br />
              <span className="text-[#555]">가장 확실한 방법</span>
            </h2>
            <a href="/about" className="inline-flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm">
              더 알아보기 <span>→</span>
            </a>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-[#aaa] text-lg leading-relaxed mb-10">
              대전 지역 대학생 혁신 네트워크 PROGEN은
              AI 기술을 단순한 지식이 아닌, 나의 경쟁력을 높이는 실전 무기로 만듭니다.
            </p>
            <div className="space-y-0">
              {missions.map((m) => (
                <div key={m.num} className="flex gap-6 border-t border-[#222] py-6">
                  <span className="text-[#444] font-black text-sm shrink-0 mt-0.5 tabular-nums">{m.num}</span>
                  <div>
                    <h3 className="text-white font-bold mb-1 text-sm">{m.title}</h3>
                    <p className="text-[#888] text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Founder */}
        <div className="border border-[#222] rounded-2xl p-8 md:p-12 mb-24">
          <div className="flex items-center gap-3 text-[#666] text-xs tracking-[0.2em] uppercase mb-10">
            <span className="w-8 h-px bg-[#333]" />
            Founder
          </div>
          <div className="flex flex-col md:flex-row gap-10">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-2xl font-black text-violet-400 mb-4">
                박
              </div>
              <p className="text-white font-black text-sm">박수훈</p>
              <p className="text-[#666] text-xs mt-0.5">Founder &amp; President</p>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-6">
                {founderTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#111] border border-[#222] text-[#888] text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <blockquote className="text-[#aaa] text-sm leading-relaxed">
                &ldquo;저 역시 여러분과 똑같은 캠퍼스에서 내일을 고민하는 4학년 대학생입니다.
                2021년 창업 이후 1.4억 원의 누적 매출과 1억 원의 지원금을 유치하며 깨달은 것은,
                결국 <span className="text-white">&lsquo;실행력&rsquo;과 &lsquo;도구의 활용&rsquo;</span>이 생존의 핵심이라는 점이었습니다.
                제가 먼저 겪은 시행착오와 노하우를 아낌없이 나누려 합니다.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>

        {/* For who */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="flex items-center gap-3 text-[#666] text-xs tracking-[0.2em] uppercase mb-8">
              <span className="w-8 h-px bg-[#333]" />
              Who is this for?
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
              이런 분들께<br />
              <span className="text-[#555]">추천해요</span>
            </h3>
          </div>
          <div>
            {forWho.map((text, i) => (
              <div key={i} className="flex items-start gap-5 py-5 border-t border-[#222]">
                <span className="text-[#444] font-black text-xs shrink-0 mt-1 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[#aaa] text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

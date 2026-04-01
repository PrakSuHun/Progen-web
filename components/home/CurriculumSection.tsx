const phases = [
  {
    label: 'Phase 1',
    period: '3 — 4월',
    title: 'AI 기초 체험',
    desc: "'AI는 쉽다'는 확신을 얻고, 대학생활의 질을 바꾸는 AI 활용법을 익힙니다.",
  },
  {
    label: 'Phase 2',
    period: '5월',
    title: '자동화 프로젝트',
    desc: 'Make, n8n 등으로 팀별 자동화 시스템을 기획·제작하고 데모데이에서 발표합니다.',
  },
  {
    label: 'Phase 3',
    period: '6 — 7월',
    title: '콘텐츠 & 실전 확장',
    desc: '영상·음악·굿즈를 만들어 실제 판매까지. 수익 구조를 직접 경험합니다.',
  },
]

export function CurriculumSection() {
  return (
    <section id="curriculum" className="py-16 md:py-24 px-5 lg:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
          Roadmap
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-black leading-tight">
            3단계 성장 여정
          </h2>
          <a href="/seminar" className="text-violet-500 hover:text-violet-600 text-sm font-semibold flex items-center gap-1 transition-colors">
            세미나 일정 보기 →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((phase, i) => (
            <div key={phase.label} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-7 hover:border-violet-200 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-lg bg-violet-500 text-white font-black text-xs flex items-center justify-center">{i + 1}</span>
                <span className="text-[#aaa] text-xs font-bold">{phase.period}</span>
              </div>
              <h3 className="text-black font-bold text-lg mb-2">{phase.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{phase.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

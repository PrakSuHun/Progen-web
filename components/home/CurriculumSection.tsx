const phases = [
  {
    label: 'Phase 1',
    period: '3 — 4월',
    title: 'AI 기초 체험',
    accent: 'bg-violet-500',
    desc: "'AI는 쉽다'는 확신을 얻고, 대학생활의 질을 바꾸는 AI 활용법을 익힙니다.",
    sessions: [
      { date: '3/28', title: 'AI 특강 & 단체 모집', detail: '생성형 AI 개념과 핵심 툴 3-4개를 직접 체험, AI 장벽 허물기' },
      { date: '4/11', title: '시험기간 AI 실전 활용', detail: 'PPT 요약, 논문 정리, 예상문제 생성 — 중간고사 학점이 달라집니다' },
    ],
  },
  {
    label: 'Phase 2',
    period: '5월',
    title: '자동화 프로젝트',
    accent: 'bg-violet-400',
    desc: 'Make, n8n 등으로 팀별 자동화 시스템을 직접 기획·제작하고 데모데이에서 발표합니다.',
    sessions: [
      { date: '5/02', title: '자동화 시스템 기초', detail: '노코드 툴(Make 등) 활용 자동화 설계 시작' },
      { date: '5/16', title: '자동화 시스템 실전', detail: 'API 및 GPT 연동 실무 프로젝트 구현' },
      { date: '5/30', title: '데모데이 (Demo Day)', detail: '완성된 포트폴리오 발표 및 우수팀 시상' },
    ],
  },
  {
    label: 'Phase 3',
    period: '6 — 7월',
    title: '콘텐츠 & 실전 확장',
    accent: 'bg-violet-300',
    desc: '영상·음악·굿즈를 만들어 실제 판매까지. 방학에 자는 동안에도 돌아가는 수익 구조를 경험합니다.',
    sessions: [
      { date: '6월', title: '콘텐츠 AI 마스터리', detail: '영상/음악/이미지 AI 기반 퍼스널 브랜딩 및 채널 개설' },
      { date: '7월', title: '실전 마켓 실험', detail: '제작물 판매 및 시장 반응 확인 — 백화점 플리마켓 입점 예정' },
    ],
  },
]

const benefits = [
  { num: '01', title: '압도적인 실전 스펙', desc: '실제 문제를 해결한 자동화 시스템 제작 경험을 쌓습니다.' },
  { num: '02', title: '강력한 네트워크', desc: '대전 지역 대학생 및 현업 전문가와의 단단한 연결고리를 만듭니다.' },
  { num: '03', title: '수익화 경험', desc: "내 아이디어로 실제 가치를 창출해본 '성공의 기억'을 갖습니다." },
  { num: '04', title: '미래 생존력', desc: '어떤 환경에서도 AI를 도구로 살아남을 수 있는 자신감을 얻습니다.' },
]

export function CurriculumSection() {
  return (
    <section id="curriculum" className="py-16 md:py-28 px-5 lg:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
          2026 Roadmap
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-black leading-tight mb-3">
          &lsquo;단순 사용자&rsquo;에서<br />
          <span className="text-violet-500">&lsquo;시스템 설계자&rsquo;로</span>
        </h2>
        <p className="text-[#777] text-sm md:text-base mb-10 md:mb-16">
          상반기 3단계 성장 여정 · 3월 ~ 7월 · 참가비 무료
        </p>

        {/* Phase cards */}
        <div className="space-y-4 mb-16 md:mb-24">
          {phases.map((phase) => (
            <div key={phase.label} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-2 h-2 rounded-full ${phase.accent}`} />
                <span className="text-violet-500 text-xs font-bold tracking-wider uppercase">{phase.label}</span>
                <span className="text-[#bbb] text-xs">{phase.period}</span>
              </div>
              <h3 className="text-black font-black text-lg md:text-xl mb-2">{phase.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed mb-5">{phase.desc}</p>
              <div className="space-y-2">
                {phase.sessions.map((s) => (
                  <div key={s.date} className="flex gap-3 md:gap-5 p-3 md:p-4 bg-violet-50/50 border border-violet-100/50 rounded-xl">
                    <span className="text-violet-500 font-bold text-sm shrink-0 w-10 md:w-12 tabular-nums">{s.date}</span>
                    <div>
                      <p className="text-black font-semibold text-sm">{s.title}</p>
                      <p className="text-[#888] text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Benefits
          </div>
          <h3 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">
            PROGEN과 함께하면<br />
            <span className="text-violet-500">얻게 될 4가지</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {benefits.map((b) => (
              <div key={b.num} className="flex gap-4 p-5 md:p-6 bg-white border border-[#eee] rounded-2xl hover:border-violet-200 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 font-black text-sm flex items-center justify-center shrink-0">{b.num}</span>
                <div>
                  <h4 className="text-black font-bold mb-1 text-sm">{b.title}</h4>
                  <p className="text-[#666] text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className="bg-violet-500 text-white rounded-2xl p-6 md:p-10">
          <div className="text-white/60 text-[11px] font-bold tracking-wider uppercase mb-5">운영 철학</div>
          <blockquote className="text-xl md:text-3xl font-black leading-snug mb-8">
            &ldquo;우리는 AI 전문가 집단이 아닙니다.<br />
            AI 도구를 활용해 문제를 해결하는 &lsquo;플랫폼&rsquo;입니다.&rdquo;
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <p className="text-white font-bold text-sm mb-1">운영진</p>
              <p className="text-white/70 text-sm leading-relaxed">방향성 제시와 실전 멘토링을 통해 여러분의 시행착오를 줄여줍니다.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <p className="text-white font-bold text-sm mb-1">참여자</p>
              <p className="text-white/70 text-sm leading-relaxed">직접 기획하고 제작하며, &lsquo;함께 실험하는 문화&rsquo;의 주인이 됩니다.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

const phases = [
  {
    label: 'Phase 1',
    period: '3 — 4월',
    title: 'AI 기초 체험',
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
    <section id="curriculum" className="py-32 px-6 lg:px-8 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 text-[#444] text-xs tracking-[0.2em] uppercase mb-20">
          <span className="w-8 h-px bg-[#2a2a2a]" />
          2026 Roadmap
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.0]">
            &lsquo;단순 사용자&rsquo;에서<br />
            <span className="text-[#2a2a2a]">&lsquo;시스템 설계자&rsquo;로</span>
          </h2>
          <div className="flex items-end">
            <p className="text-[#666] text-lg leading-relaxed">
              상반기 3단계 성장 여정<br />
              3월 ~ 7월 · 참가비 무료
            </p>
          </div>
        </div>

        {/* Phase list */}
        <div className="mb-28">
          {phases.map((phase) => (
            <div key={phase.label} className="grid grid-cols-1 md:grid-cols-3 border-t border-[#1a1a1a] py-10 gap-8">
              <div>
                <div className="text-[#333] text-xs font-bold tracking-widest uppercase mb-2">{phase.label}</div>
                <div className="text-white font-black text-xl mb-1">{phase.title}</div>
                <div className="text-[#444] text-sm">{phase.period}</div>
              </div>
              <div className="md:col-span-2">
                <p className="text-[#666] text-sm mb-6 leading-relaxed">{phase.desc}</p>
                <div className="space-y-2">
                  {phase.sessions.map((s) => (
                    <div key={s.date} className="flex gap-6 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-5 py-4">
                      <span className="text-violet-400 font-black text-sm shrink-0 w-12 tabular-nums">{s.date}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{s.title}</p>
                        <p className="text-[#444] text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-28">
          <div className="flex items-center gap-3 text-[#444] text-xs tracking-[0.2em] uppercase mb-12">
            <span className="w-8 h-px bg-[#2a2a2a]" />
            Benefits
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
              PROGEN과 함께하면<br />
              <span className="text-[#2a2a2a]">얻게 될 4가지</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#1a1a1a]">
            {benefits.map((b, i) => (
              <div
                key={b.num}
                className="flex gap-6 p-8 border-b border-r border-[#1a1a1a]"
              >
                <span className="text-[#2a2a2a] font-black text-xl shrink-0 tabular-nums">{b.num}</span>
                <div>
                  <h4 className="text-white font-bold mb-2 text-sm">{b.title}</h4>
                  <p className="text-[#666] text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className="border-t border-[#1a1a1a] pt-20">
          <div className="flex items-center gap-3 text-[#444] text-xs tracking-[0.2em] uppercase mb-10">
            <span className="w-8 h-px bg-[#2a2a2a]" />
            운영 철학
          </div>
          <blockquote className="text-3xl md:text-4xl font-black text-white leading-snug max-w-3xl mb-14">
            &ldquo;우리는 AI 전문가 집단이 아닙니다.<br />
            AI 도구를 활용해 문제를 해결하는 &lsquo;플랫폼&rsquo;입니다.&rdquo;
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-[#1a1a1a]">
            <div className="py-8 md:pr-12 md:border-r border-[#1a1a1a]">
              <p className="text-white font-bold text-sm mb-2">운영진</p>
              <p className="text-[#666] text-sm leading-relaxed">방향성 제시와 실전 멘토링을 통해 여러분의 시행착오를 줄여줍니다.</p>
            </div>
            <div className="py-8 md:pl-12 border-t md:border-t-0 border-[#1a1a1a]">
              <p className="text-white font-bold text-sm mb-2">참여자</p>
              <p className="text-[#666] text-sm leading-relaxed">직접 기획하고 제작하며, &lsquo;함께 실험하는 문화&rsquo;의 주인이 됩니다.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

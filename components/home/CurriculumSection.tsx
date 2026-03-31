export function CurriculumSection() {
  const phases = [
    {
      label: 'Phase 1',
      period: '3 ~ 4월',
      title: 'AI 기초 체험',
      color: 'border-purple-500/40',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: '\'AI는 쉽다\'는 확신을 얻고, 대학생활의 질을 바꾸는 AI 활용법을 익힙니다.',
      sessions: [
        { date: '3/28', title: 'AI 특강 & 단체 모집', detail: '생성형 AI 개념과 핵심 툴 3~4개를 직접 체험, AI 장벽 허물기' },
        { date: '4/11', title: '시험기간 AI 실전 활용', detail: 'PPT 요약, 논문 정리, 예상문제 생성 — 중간고사 학점이 달라집니다' },
      ],
    },
    {
      label: 'Phase 2',
      period: '5월',
      title: '자동화 프로젝트',
      color: 'border-indigo-500/40',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      desc: 'Make, n8n 등으로 팀별 자동화 시스템을 직접 기획·제작하고 데모데이에서 발표합니다.',
      sessions: [
        { date: '5/02', title: '자동화 시스템 기초', detail: '노코드 툴(Make 등) 활용 자동화 설계 시작' },
        { date: '5/16', title: '자동화 시스템 실전', detail: 'API 및 GPT 연동 실무 프로젝트 구현' },
        { date: '5/30', title: '데모데이 (Demo Day)', detail: '완성된 포트폴리오 발표 및 우수팀 시상' },
      ],
    },
    {
      label: 'Phase 3',
      period: '6 ~ 7월',
      title: '콘텐츠 & 실전 확장',
      color: 'border-emerald-500/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
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
    { num: '03', title: '수익화 경험', desc: '내 아이디어로 실제 가치를 창출해본 \'성공의 기억\'을 갖습니다.' },
    { num: '04', title: '미래 생존력', desc: '어떤 환경에서도 AI를 도구로 살아남을 수 있는 자신감을 얻습니다.' },
  ]

  return (
    <section id="curriculum" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-6xl mx-auto">

        {/* 헤더 */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">2026 Roadmap</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            &lsquo;단순 사용자&rsquo;에서{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              &lsquo;시스템 설계자&rsquo;
            </span>
            로
          </h2>
          <p className="text-slate-400 text-lg">
            상반기 3단계 성장 여정 · 3월 ~ 7월 · 참가비 무료
          </p>
        </div>

        {/* Phase 카드 */}
        <div className="space-y-6 mb-16">
          {phases.map((phase) => (
            <div key={phase.label} className={`border ${phase.color} bg-slate-800/30 rounded-3xl p-8`}>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* 왼쪽: Phase 정보 */}
                <div className="flex-shrink-0 md:w-56">
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${phase.badgeColor} mb-3`}>
                    {phase.label} · {phase.period}
                  </span>
                  <h3 className="text-xl font-black text-white mb-2">{phase.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{phase.desc}</p>
                </div>

                {/* 오른쪽: 세션 */}
                <div className="flex-1 space-y-3">
                  {phase.sessions.map((s) => (
                    <div key={s.date} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                      <span className="flex-shrink-0 w-14 text-purple-400 font-black text-sm pt-0.5">{s.date}</span>
                      <div>
                        <p className="text-white font-semibold text-sm mb-0.5">{s.title}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PROGEN과 함께하면 얻게 될 4가지 */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">Benefits</p>
            <h3 className="text-3xl md:text-4xl font-black text-white">PROGEN과 함께하면 얻게 될 4가지</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div key={b.num} className="flex items-start gap-4 p-6 bg-slate-800/50 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors">
                <span className="text-purple-400 font-black text-2xl shrink-0 leading-none">{b.num}</span>
                <div>
                  <h4 className="text-white font-bold mb-1">{b.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 운영 철학 */}
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-3xl p-8 md:p-10">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-4">운영 철학</p>
          <blockquote className="text-xl md:text-2xl font-black text-white mb-6 leading-snug">
            &ldquo;우리는 AI 전문가 집단이 아닙니다.<br />
            AI 도구를 활용해 문제를 해결하는 &lsquo;플랫폼&rsquo;입니다.&rdquo;
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-5">
              <p className="text-white font-bold mb-1">운영진</p>
              <p className="text-slate-400 text-sm leading-relaxed">방향성 제시와 실전 멘토링을 통해 여러분의 시행착오를 줄여줍니다.</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-5">
              <p className="text-white font-bold mb-1">참여자</p>
              <p className="text-slate-400 text-sm leading-relaxed">직접 기획하고 제작하며, &lsquo;함께 실험하는 문화&rsquo;의 주인이 됩니다.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

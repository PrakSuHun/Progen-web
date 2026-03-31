export function CurriculumSection() {
  const sessions = [
    {
      month: '4월',
      theme: '시험공부용 AI',
      icon: '📚',
      color: 'border-purple-500/40 bg-purple-500/5',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      tag: '중간고사 시즌',
      desc: 'AI로 시험 범위를 정리하고 예상 문제를 뽑아 공부 시간을 절반으로 줄이는 방법을 실습합니다.',
      detail: '"4월 클래스 참석하신 분들은 이걸 1학년 때 알았으면 학점이 달랐을 텐데 소리가 절로 나오실 거에요."',
      tools: ['NotebookLM', 'ChatGPT', 'Perplexity'],
    },
    {
      month: '5월',
      theme: '자동화 시스템',
      icon: '⚡',
      color: 'border-indigo-500/40 bg-indigo-500/5',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      tag: '반복 작업 제거',
      desc: '장학금·공모전·채용 정보 자동 알림, 수업 녹음 → 노트 정리 → 문제 출제까지 단 한 번에 자동화합니다.',
      detail: '"오늘 QR코드 찍고 이름 넣으니 바로 접수된 것, 그게 PROGEN이 직접 만든 AI 자동화 시스템입니다."',
      tools: ['Make', 'Zapier', 'Notion AI'],
    },
    {
      month: '6월',
      theme: 'AI로 수익화하기',
      icon: '🎬',
      color: 'border-emerald-500/40 bg-emerald-500/5',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      tag: '방학 프로젝트',
      desc: 'AI로 영상 편집과 음악 제작을 배우고 그날 바로 숏폼 영상을 만들어 실제 수익으로 연결하는 구조를 실습합니다.',
      detail: '"방학 때 시급 받으러 카운터 앞에 서 있을 건지, AI로 자는 동안에도 돌아가는 수익 구조를 만들 건지."',
      tools: ['CapCut AI', 'Suno', 'YouTube'],
    },
    {
      month: '7월',
      theme: 'AI 굿즈 + 플리마켓',
      icon: '🛍️',
      color: 'border-rose-500/40 bg-rose-500/5',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      tag: '야심 프로젝트',
      desc: '대전 꿈돌이 굿즈 판매 1위 강사님과 함께 AI로 내 캐릭터를 만들고 신세계·롯데백화점 플리마켓에 직접 판매합니다.',
      detail: '"실제로 신세계, 롯데백화점 플리마켓 입점까지 사전 협의가 완료되었습니다."',
      tools: ['Midjourney', 'Adobe Firefly', 'Printful'],
    },
  ]

  return (
    <section id="curriculum" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">1기 커리큘럼</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            한 학기 안에 일어날{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              변화
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            4월 ~ 7월 · 월 1회 · 총 4회차 · 참가비 무료<br />
            <span className="text-sm text-slate-500">크루원이 필요하다고 생각하는 클래스만 골라서 참석해도 됩니다.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((s) => (
            <div
              key={s.month}
              className={`border ${s.color} rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{s.icon}</span>
                  <div>
                    <p className="text-slate-500 text-sm font-bold">{s.month}</p>
                    <h3 className="text-xl font-black text-white">{s.theme}</h3>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${s.badgeColor}`}>
                  {s.tag}
                </span>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-4">{s.desc}</p>

              <blockquote className="text-slate-500 text-xs italic leading-relaxed border-l-2 border-white/10 pl-3 mb-5">
                {s.detail}
              </blockquote>

              <div className="flex flex-wrap gap-2">
                {s.tools.map((tool) => (
                  <span key={tool} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-xs rounded-full font-medium">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 추가 혜택 */}
        <div className="mt-12 bg-slate-800/40 border border-white/10 rounded-3xl p-8 md:p-10">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-6">크루원 전용 혜택</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎤', title: '현직자 초청 강연', desc: '각 분야 전문가의 AI 시대 생존 전략을 직접 듣습니다. (5월, 7월 예정)' },
              { icon: '💬', title: '카카오톡 크루 채널', desc: 'AI 최신 정보, 대학생활 팁, 현업 소식이 매주 업데이트됩니다.' },
              { icon: '🏅', title: '수료증 발급', desc: '모든 커리큘럼 수료 후 공식 수료증이 발급됩니다.' },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{b.icon}</span>
                <div>
                  <h4 className="text-white font-bold mb-1">{b.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

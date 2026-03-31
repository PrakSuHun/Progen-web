export function AboutSection() {
  const missions = [
    {
      icon: '🔥',
      title: 'AI 생존 전략',
      desc: '모든 일자리가 위협받는 시대, AI에게 대체되는 것이 아니라 AI를 다루는 법을 배웁니다.',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      icon: '🌍',
      title: '지역 기반 혁신',
      desc: '대전 지역 대학생들이 모여 지역 사회와 기업의 문제를 AI로 직접 해결합니다.',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      icon: '💼',
      title: '실전형 스펙',
      desc: '단순 학습(Study)을 넘어, 이력서에 바로 쓸 수 있는 프로젝트 결과물(Output)을 만듭니다.',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  ]

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* 헤더 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">
            What is PROGEN?
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            AI 시대를 생존하는{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              가장 확실한 방법
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            대전 지역 대학생 혁신 네트워크 PROGEN은<br />
            AI 기술을 단순한 지식이 아닌, 나의 경쟁력을 높이는 &lsquo;실전 무기&rsquo;로 만듭니다.
          </p>
        </div>

        {/* 미션 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {missions.map((m) => (
            <div
              key={m.title}
              className={`border ${m.color} bg-slate-800/50 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300`}
            >
              <div className="text-4xl mb-5">{m.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{m.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* 대표 소개 */}
        <div className="bg-slate-800/40 border border-white/10 rounded-3xl p-8 md:p-12 mb-20">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-8">Founder</p>
          <div className="flex flex-col md:flex-row gap-10">
            {/* 프로필 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-3xl font-black text-purple-400 mb-4">
                박
              </div>
              <p className="text-white font-black text-lg">박수훈</p>
              <p className="text-slate-500 text-sm">Park Su-hun</p>
              <p className="text-slate-500 text-sm mt-1">Founder &amp; President</p>
            </div>
            {/* 내용 */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  '충남대 자율운항시스템공학과 4학년',
                  '인스피릿(Inspirit) 대표이사',
                  '누적 매출 1.4억',
                  '정부지원금 1억 유치',
                  '골드칼라 공학도상',
                  '청년창업사관학교 졸업',
                ].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <blockquote className="text-slate-300 text-base leading-relaxed">
                &ldquo;저 역시 여러분과 똑같은 캠퍼스에서 내일을 고민하는 4학년 대학생입니다.
                2021년 창업 이후 1.4억 원의 누적 매출과 1억 원의 지원금을 유치하며 깨달은 것은,
                결국 <span className="text-white font-bold">&lsquo;실행력&rsquo;과 &lsquo;도구의 활용&rsquo;</span>이 생존의 핵심이라는 점이었습니다.
                제가 먼저 겪은 시행착오와 노하우를 혼자만의 자산으로 남기지 않고,
                PROGEN 동료들과 아낌없이 나누려 합니다.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>

        {/* 수강 대상 */}
        <div>
          <div className="text-center mb-10">
            <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">Who is this for?</p>
            <h3 className="text-3xl md:text-4xl font-black text-white">이런 분들께 추천해요!</h3>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              'AI를 배우고 싶지만 어디서부터 시작해야 할지 막막한 대학생',
              'ChatGPT를 써봤지만 원하는 답변을 못 얻고 시간만 낭비한 분',
              '나만의 실전 프로젝트를 만들어 이력서에 남기고 싶은 분',
              '단순한 강의가 아니라 함께 성장할 동료와 네트워크를 원하는 분',
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-purple-400 font-black text-xl mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-slate-300 font-medium leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

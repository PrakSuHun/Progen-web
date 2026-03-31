export function AboutSection() {
  const values = [
    {
      icon: '🤖',
      title: '직접 써보는 AI',
      desc: 'AI를 배우기 위해 유튜브 강의 보고 끝나는 곳이 아닙니다. AI를 직접 써보고, 만들어보며, 실제로 써먹는 크루입니다.',
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: '⚡',
      title: '압도적인 시간 단축',
      desc: '남들 3시간 걸릴 레포트를 30분 만에. 시험범위 정리, PPT 자동화, 수업 녹음 → 노트까지 AI로 한번에 해결합니다.',
      color: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      icon: '💰',
      title: '실전 수익 창출',
      desc: 'AI로 영상·음악·굿즈를 만들어 플리마켓에 직접 판매합니다. 방학에 알바 말고 AI로 수익 구조를 만드는 경험.',
      color: 'bg-emerald-500/10 text-emerald-400',
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
            AI를 도구로{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              대학생의 실전 경쟁력
            </span>
            을 만드는 크루
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            대전에서는 유일무이한 대학생 AI 활용 단체입니다.<br />
            누구나 쉽게 접근할 수 있는 AI 커뮤니티를 지향합니다.
          </p>
        </div>

        {/* 가치 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-slate-800/50 border border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`w-14 h-14 rounded-full ${v.color} flex items-center justify-center text-2xl mb-6`}>
                {v.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{v.title}</h3>
              <p className="text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* 설립 계기 */}
        <div className="bg-slate-800/40 border border-white/10 rounded-3xl p-8 md:p-12 mb-20">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-4">설립 계기</p>
          <blockquote className="text-2xl md:text-3xl font-black text-white leading-snug mb-6">
            &ldquo;이건 혼자 알 게 아니라,<br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              우리 대학생들이 반드시 가져야 할 생존 무기다.
            </span>&rdquo;
          </blockquote>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            PROGEN 대표는 창업 5년차이자 충남대 재학생입니다. 창업동아리 회장을 맡으며 늘 시간에 쫓겼지만,
            AI를 적극 활용한 이후 레포트를 30분 만에 끝내고 교수님께 &ldquo;인사이트가 훌륭하다&rdquo;는 칭찬을 들었습니다.
            대학을 다니며 누적 매출 1억 5천만 원, 전액 장학금까지. 이 경험이 PROGEN의 출발점입니다.
          </p>
        </div>

        {/* 수강 대상 */}
        <div>
          <div className="text-center mb-10">
            <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">Who is this for?</p>
            <h3 className="text-3xl md:text-4xl font-black text-white">이런 분들께 추천해요!</h3>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              'ChatGPT를 써봤지만 원하는 답변을 못 얻고 시간만 낭비한 분',
              '남들 3시간 걸리는 레포트를 더 빠르고 잘 끝내고 싶은 분',
              'AI를 활용해 실제로 수익 구조를 만들어보고 싶은 분',
              '단순한 강의가 아니라 함께 성장할 동료와 커뮤니티를 원하는 분',
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

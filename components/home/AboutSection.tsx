export function AboutSection() {
  const values = [
    {
      icon: '🤖',
      title: '내 삶의 자동화',
      desc: '귀찮은 학과 공지 확인, 과제 일정 관리를 AI가 대신하게 만듭니다. 나만의 맞춤형 비서를 구축하세요.',
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: '⚡',
      title: '압도적인 시간 단축',
      desc: '시험기간 논문 요약봇, PPT 초안 작성 자동화로 A+와 여유를 동시에 잡습니다. 효율의 극대화를 경험하세요.',
      color: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      icon: '💰',
      title: '실전 수익 창출',
      desc: 'AI로 콘텐츠와 굿즈를 만들어, 직접 판매 실험까지 진행합니다. 이력서에 남는 진짜 성과를 만듭니다.',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
  ]

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">
            Our Core Value
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            &ldquo;배우는 AI가 아니라,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              만드는 AI
            </span>
            &rdquo;
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            전문 개발자가 될 필요는 없습니다. 이미 세상에 나온 강력한 AI 도구들을 조립해서 내 삶에 당장 적용하는 방법을 배웁니다.
          </p>
        </div>

        {/* 가치 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* 수강 대상 */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <p className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-3">Who is this for?</p>
            <h3 className="text-3xl md:text-4xl font-black text-white">이런 분들께 추천해요!</h3>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              '쏟아지는 과제와 레포트에 어디서부터 손대야 할지 막막한 분',
              'ChatGPT를 써봤지만, 원하는 답변을 얻지 못하고 시간만 낭비한 분',
              'AI를 활용해 과제의 \'양\'과 \'질\'을 모두 잡고 싶은 분',
              '단순한 강의가 아닌, 직접 AI를 활용하며 함께 성장할 동료를 만나고 싶은 분',
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

export function ActivitiesSection() {
  const reviews = [
    {
      text: '"평소 전공 논문 읽는 게 너무 두려웠는데, 워크숍에서 배운 AI 요약 기법 덕분에 이제는 30분이면 핵심을 다 파악합니다. 남들보다 과제 퀄리티가 확연히 달라졌어요."',
      name: '김*현',
      school: '충남대학교',
      major: '경영학부',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      text: '"디자인 감각이 전혀 없는 똥손이라 매번 팀플 PPT 담당 피하기 바빴습니다. Gamma와 AI 이미지 생성 툴을 배운 후에는 제가 먼저 디자인을 맡겠다고 나설 정도입니다!"',
      name: '이*진',
      school: '충남대학교',
      major: '컴퓨터융합학부',
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      text: '"단순히 ChatGPT 버튼 누르는 법을 알려주는 게 아니라, 대학생의 실제 과제와 시험 공부에 특화된 프롬프트를 짜주셔서 당장 다음 주 중간고사에 적용할 생각에 설렙니다."',
      name: '박*우',
      school: '충남대학교',
      major: '사회과학대학',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black/30 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-bold tracking-widest text-sm uppercase mb-3">
            Proven Track Record
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            이미 수많은 대학생이{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              혁신
            </span>
            을 경험했습니다.
          </h2>
          <p className="text-slate-400 text-lg">성황리에 마친 지난 CNU AI 워크숍 생생 후기</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-slate-800/50 border border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300"
            >
              {/* 별점 */}
              <div className="flex items-center gap-1 text-yellow-400 mb-4 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">{r.text}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${r.color} border flex items-center justify-center font-black text-sm`}>
                  {r.name}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">{r.school}</p>
                  <p className="text-slate-500">{r.major}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

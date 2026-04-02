const months = [
  {
    month: '04',
    title: '시험공부용 AI',
    headline: '중간고사 집중 대비',
    desc: 'AI로 시험 범위를 요약·정리하고 예상 문제를 추출합니다. 시험 공부 시간을 절반으로 단축시켜 드립니다.',
    highlight: '당장 중간고사 학점이 달라지는 경험을 하실 겁니다!',
  },
  {
    month: '05',
    title: '일상 자동화 시스템',
    headline: '시간을 돌려받는',
    desc: '장학금·공모전·채용 정보 키워드 자동 알림 시스템을 구축하고, 수업 녹음본 하나로 요약·문제출제를 끝냅니다.',
    highlight: '반복 작업에 쓰던 시간을 통째로 돌려받으세요',
  },
  {
    month: '06',
    title: 'AI 숏폼과 음악 제작',
    headline: '온라인 수익화',
    desc: '그날 배우고 즉시 업로드. 자본금 없이 시작하는 나만의 온라인 수익화 채널을 만듭니다.',
    highlight: '알바 대신 자동 수익 채널 구축',
  },
  {
    month: '07',
    title: 'AI 캐릭터 굿즈 제작',
    headline: '기획부터 판매까지',
    desc: '내 캐릭터 기획부터 굿즈 판매까지 한 번에! 쏠쏠한 수익화를 경험해 보세요.',
    highlight: '신세계·롯데백화점 플리마켓 입점 사전 협의 완료!',
  },
]

export function CurriculumSection() {
  return (
    <section id="curriculum" className="py-14 md:py-24 px-5 lg:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
          Curriculum
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-black leading-snug mb-2">
          PROGEN 1기<br className="md:hidden" /> <span className="text-violet-500">상반기 커리큘럼</span>
        </h2>
        <p className="text-[#888] text-xs md:text-sm mb-8">
          모든 클래스는 한 달 내내가 아닌, <span className="text-black font-bold">월 1회만</span> 핵심 압축 진행됩니다.
        </p>

        <div className="space-y-3">
          {months.map((m) => (
            <div key={m.month} className="bg-white border border-[#eee] rounded-2xl p-4 md:p-7 hover:border-violet-200 transition-colors">
              <div className="flex gap-4 md:gap-5">
                <div className="shrink-0">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-violet-500 text-white flex flex-col items-center justify-center">
                    <span className="text-[8px] md:text-[9px] font-bold tracking-widest uppercase leading-none">MONTH</span>
                    <span className="text-xl md:text-3xl font-black leading-none mt-0.5">{m.month}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-xl font-black text-black mb-1 leading-snug">
                    {m.headline} <span className="text-violet-500">{m.title}</span>
                  </h3>
                  <p className="text-[#555] text-xs md:text-sm leading-relaxed mb-2.5">{m.desc}</p>
                  <div className="inline-flex items-center px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-lg">
                    <span className="text-violet-500 text-xs md:text-sm leading-snug">{m.highlight}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

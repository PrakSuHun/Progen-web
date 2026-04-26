const reviews = [
  {
    text: '평소 전공 논문 읽는 게 너무 두려웠는데, 워크숍에서 배운 AI 요약 기법 덕분에 이제는 30분이면 핵심을 다 파악합니다. 남들보다 과제 퀄리티가 확연히 달라졌어요.',
    name: '김*현',
    school: '충남대학교',
    major: '경영학부',
  },
  {
    text: '디자인 감각이 전혀 없는 똥손이라 매번 팀플 PPT 담당 피하기 바빴습니다. 노트북LM과 AI 이미지 생성 툴을 배운 후에는 제가 먼저 디자인을 맡겠다고 나설 정도입니다!',
    name: '이*진',
    school: '충남대학교',
    major: '컴퓨터융합학부',
  },
  {
    text: '단순히 ChatGPT 버튼 누르는 법을 알려주는 게 아니라, 대학생의 실제 과제와 시험 공부에 특화된 프롬프트를 짜주셔서 당장 다음 주 중간고사에 적용할 생각에 설렙니다.',
    name: '박*우',
    school: '충남대학교',
    major: '사회과학대학',
  },
]

export function ActivitiesSection() {
  return (
    <section className="py-16 md:py-28 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
          Proven Track Record
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-black leading-tight mb-3">
          이미 수많은 대학생이<br />
          <span className="text-sky-500">혁신을 경험했습니다.</span>
        </h2>
        <p className="text-[#777] text-sm md:text-base mb-10 md:mb-14">
          성황리에 마친 지난 CNU AI 워크숍 · 실제 참가자 후기
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div key={r.name} className="p-5 md:p-7 bg-[#fafafa] border border-[#eee] rounded-2xl flex flex-col justify-between hover:border-sky-200 transition-colors">
              <div>
                <div className="text-sky-400 text-xs tracking-wider mb-4">★ ★ ★ ★ ★</div>
                <p className="text-[#444] text-sm leading-[1.8] mb-6">&ldquo;{r.text}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#eee]">
                <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-xs font-black text-sky-600 shrink-0">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-black text-sm font-bold">{r.name} · {r.school}</p>
                  <p className="text-[#999] text-xs">{r.major}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

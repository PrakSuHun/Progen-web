const reviews = [
  {
    text: '평소 전공 논문 읽는 게 너무 두려웠는데, 워크숍에서 배운 AI 요약 기법 덕분에 이제는 30분이면 핵심을 다 파악합니다. 남들보다 과제 퀄리티가 확연히 달라졌어요.',
    name: '김*현',
    school: '충남대학교',
    major: '경영학부',
  },
  {
    text: '디자인 감각이 전혀 없는 똥손이라 매번 팀플 PPT 담당 피하기 바빴습니다. Gamma와 AI 이미지 생성 툴을 배운 후에는 제가 먼저 디자인을 맡겠다고 나설 정도입니다!',
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
    <section className="py-20 md:py-32 px-5 lg:px-8 border-t border-[#e0e0e0]">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-3 text-[#999] text-[11px] tracking-[0.2em] uppercase mb-12 md:mb-20">
          <span className="w-6 h-px bg-[#ccc]" />
          Proven Track Record
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-black leading-tight">
            이미 수많은 대학생이<br />
            <span className="text-[#ccc]">혁신을 경험했습니다.</span>
          </h2>
          <div className="flex items-end">
            <p className="text-[#555] leading-relaxed text-sm">
              성황리에 마친 지난 CNU AI 워크숍<br />실제 참가자 후기
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:border-t md:border-l md:border-[#e0e0e0]">
          {reviews.map((r) => (
            <div key={r.name} className="p-6 md:p-8 border border-[#e0e0e0] md:border-0 md:border-b md:border-r md:border-[#e0e0e0] rounded-xl md:rounded-none flex flex-col justify-between bg-[#fafafa] md:bg-transparent">
              <div>
                <div className="text-yellow-500 text-xs tracking-widest mb-5">★ ★ ★ ★ ★</div>
                <p className="text-[#444] text-sm leading-relaxed mb-6">&ldquo;{r.text}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f0f0f0] border border-[#e0e0e0] flex items-center justify-center text-xs font-black text-violet-500 shrink-0">
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

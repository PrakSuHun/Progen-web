import { Reveal } from '@/components/Reveal'

const reviews = [
  {
    text: '평소 전공 논문 읽는 게 너무 두려웠는데, 워크숍에서 배운 AI 요약 기법 덕분에 이제는 30분이면 핵심을 다 파악합니다.',
    name: '김*현', school: '충남대학교', major: '경영학부',
  },
  {
    text: '디자인 감각이 전혀 없는 똥손이라 매번 팀플 PPT 담당 피하기 바빴습니다. 노트북LM과 AI 이미지 생성 툴을 배운 후에는 제가 먼저 디자인을 맡겠다고 나설 정도입니다!',
    name: '이*진', school: '충남대학교', major: '컴퓨터융합학부',
  },
  {
    text: '대학생의 실제 과제와 시험 공부에 특화된 프롬프트를 짜주셔서 당장 다음 주 중간고사에 적용할 생각에 설렙니다.',
    name: '박*우', school: '충남대학교', major: '사회과학대학',
  },
]

export function ReviewsSection() {
  return (
    <section className="py-14 md:py-24 px-5 lg:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Reviews
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-black leading-snug mb-2">
            참가자 <span className="text-violet-500">생생 후기</span>
          </h2>
          <p className="text-[#888] text-xs md:text-sm mb-8">CNU AI 워크숍 실제 참가자 후기</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 100}>
              <div className="p-4 md:p-7 bg-white border border-[#eee] rounded-2xl flex flex-col justify-between card-lift hover:border-violet-200 h-full">
                <div>
                  <div className="text-violet-400 text-xs tracking-wider mb-3">★ ★ ★ ★ ★</div>
                  <p className="text-[#444] text-xs md:text-sm leading-[1.8] mb-5">&ldquo;{r.text}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#eee]">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-black text-violet-600 shrink-0">{r.name[0]}</div>
                  <div>
                    <p className="text-black text-xs md:text-sm font-bold">{r.name} · {r.school}</p>
                    <p className="text-[#999] text-[10px] md:text-xs">{r.major}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

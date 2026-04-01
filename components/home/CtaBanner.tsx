export function CtaBanner() {
  const deadline = process.env.NEXT_PUBLIC_DEADLINE_DATE || '2026-04-30'

  const details = [
    { label: '모집 마감', value: deadline },
    { label: '모집 대상', value: '성장하고 싶은 대학생 누구나 (전공 무관)' },
    { label: '커리큘럼', value: '4월 ~ 7월 · 월 1회 총 4회차' },
    { label: '참가비', value: '무료 (진짜입니다)' },
    { label: '크루 혜택', value: '카카오톡 커뮤니티 · 현직자 강연 · 수료증 발급' },
  ]

  return (
    <section id="apply" className="py-16 md:py-28 px-5 lg:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">

        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
          Join PROGEN
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-black leading-tight mb-5">
              격차를 당하는 쪽이 아니라<br />
              <span className="text-violet-500">격차를 만드는 주인공</span>이 되세요
            </h2>
            <p className="text-[#555] text-sm md:text-base leading-relaxed">
              &ldquo;AI가 여러분의 일자리를 뺏는 게 아닙니다.<br />
              AI를 쓰는 사람이, 못 쓰는 사람의 자리를 뺏는 것입니다.&rdquo;
            </p>
          </div>

          <div>
            <div className="bg-white border border-[#eee] rounded-2xl overflow-hidden mb-5">
              {details.map((d, i) => (
                <div
                  key={d.label}
                  className={`flex gap-4 px-5 py-3.5 ${i < details.length - 1 ? 'border-b border-[#f0f0f0]' : ''}`}
                >
                  <span className="text-violet-500 text-sm font-semibold shrink-0 w-16 md:w-20">{d.label}</span>
                  <span className="text-[#333] text-sm">{d.value}</span>
                </div>
              ))}
            </div>

            <a
              href="/apply"
              className="w-full block text-center bg-violet-500 text-white font-black py-4 rounded-full text-base hover:bg-violet-600 transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              PROGEN 1기 크루 지원하기 →
            </a>
            <p className="text-[#aaa] text-xs text-center mt-3">
              부담 갖지 마세요. 필요한 클래스만 골라서 참석해도 좋습니다.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

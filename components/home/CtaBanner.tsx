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
    <section id="apply" className="py-20 md:py-32 px-5 lg:px-8 border-t border-[#e0e0e0] bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-3 text-[#999] text-[11px] tracking-[0.2em] uppercase mb-12 md:mb-20">
          <span className="w-6 h-px bg-[#ccc]" />
          Join PROGEN
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-black leading-[1.05] mb-6">
              격차를 당하는<br />
              쪽이 아니라<br />
              <span className="text-[#ccc]">격차를 만드는<br />주인공이 되세요</span>
            </h2>
            <p className="text-[#666] text-[15px] leading-relaxed">
              &ldquo;AI가 여러분의 일자리를 뺏는 게 아닙니다.<br />
              AI를 쓰는 사람이, 못 쓰는 사람의 자리를 뺏는 것입니다.&rdquo;
            </p>
          </div>

          <div>
            <div className="border border-[#e0e0e0] rounded-2xl overflow-hidden bg-white mb-5">
              {details.map((d, i) => (
                <div
                  key={d.label}
                  className={`flex gap-4 md:gap-6 px-5 py-3.5 ${i < details.length - 1 ? 'border-b border-[#e0e0e0]' : ''}`}
                >
                  <span className="text-[#999] text-sm shrink-0 w-16 md:w-20">{d.label}</span>
                  <span className="text-[#333] text-sm">{d.value}</span>
                </div>
              ))}
            </div>

            <a
              href="/apply"
              className="w-full block text-center bg-black text-white font-black py-4 rounded-full text-base hover:bg-violet-500 transition-all duration-300"
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

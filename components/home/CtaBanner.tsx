const benefits = [
  { title: '카카오톡 팀 채팅방', desc: 'AI 최신 정보, 대학생활 꿀팁, 취업 정보 등을 공유하며 든든한 크루원들과 네트워킹' },
  { title: '세미나 강의노트 무료 제공', desc: '모든 클래스의 강의자료를 언제든 복습할 수 있습니다' },
  { title: '현직자 네트워킹', desc: '대표 직강 + 현업 전문가 특강으로 실전 노하우를 얻으세요' },
  { title: '수료증 발급', desc: '활동 수료증으로 대외활동 이력을 증명하세요' },
]

export function CtaBanner() {
  return (
    <>
      {/* 크루 혜택 */}
      <section className="py-14 md:py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Crew Benefits
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-black leading-snug mb-6">
            크루가 되면<br className="md:hidden" /> <span className="text-violet-500">이런 혜택</span>이 있어요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b, i) => (
              <div key={b.title} className="flex gap-4 p-4 md:p-5 bg-[#fafafa] border border-[#eee] rounded-2xl hover:border-violet-200 transition-colors">
                <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-violet-500 text-white font-black text-xs md:text-sm flex items-center justify-center shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-black font-bold text-sm mb-1">{b.title}</h3>
                  <p className="text-[#666] text-xs md:text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 진입장벽 해소 */}
      <section className="py-14 md:py-24 px-5 lg:px-8 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            No Barrier
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-black leading-snug mb-2">
            진입장벽 해소
          </h2>
          <p className="text-violet-500 text-xl md:text-2xl font-black mb-3">원하는 만큼만, 자유롭게</p>
          <p className="text-[#888] text-sm mb-6">부담 갖지 마세요. 나에게 맞는 방식으로 참여하면 됩니다.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-5 md:p-7 bg-white border border-[#eee] rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-500 font-bold text-base flex items-center justify-center mb-3">✓</div>
              <h3 className="text-black font-bold text-sm mb-1.5">모든 클래스 필참 X</h3>
              <p className="text-[#666] text-xs md:text-sm leading-relaxed">
                바쁜 시험 기간엔 쉬어도 좋습니다.
                <span className="text-black font-semibold"> 원하는 달만 골라 듣거나 커뮤니티에만 소속되어 있어도 환영</span>합니다.
              </p>
            </div>
            <div className="p-5 md:p-7 bg-white border border-[#eee] rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-500 font-bold text-base flex items-center justify-center mb-3">👥</div>
              <h3 className="text-black font-bold text-sm mb-1.5">PROGEN 1기 팀 채팅방</h3>
              <p className="text-[#666] text-xs md:text-sm leading-relaxed">
                AI 최신 정보, 대학생활 꿀팁, 취업 정보 등을 <span className="text-black font-semibold">공유</span>하며
                든든한 크루원들과의 네트워킹 환경이 세팅됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-violet-500 text-white rounded-2xl p-5 md:p-10 text-center">
            <p className="text-white/70 text-xs mb-3">3월 28일 클래스 신청자 우선 안내 중입니다.</p>
            <h2 className="text-xl md:text-3xl font-black mb-2 leading-snug">
              합류를 원하신다면<br />
              PROGEN 1기 크루원으로<br className="md:hidden" /> 신청해주세요
            </h2>
            <p className="text-white/60 text-xs md:text-sm mb-5">무료 · 전공 무관 · 대전 소재 대학생 누구나</p>
            <a href="/apply"
              className="inline-block px-7 py-3.5 bg-white text-violet-600 font-black rounded-full text-sm md:text-base hover:bg-violet-50 transition-colors">
              1기 크루 지원하기 →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

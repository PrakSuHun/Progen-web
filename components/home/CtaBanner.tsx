export function CtaBanner() {
  const deadline = process.env.NEXT_PUBLIC_DEADLINE_DATE || '2026-04-30'

  return (
    <section id="apply" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-purple-900/20 border-t border-white/10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          격차를 당하는 쪽이 아니라<br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            격차를 만드는 주인공
          </span>
          이 되세요
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          &ldquo;AI가 여러분의 일자리를 뺏는 게 아닙니다.<br />
          AI를 쓰는 사람이, 못 쓰는 사람의 자리를 뺏는 것입니다.&rdquo;
        </p>

        <div className="bg-slate-900/80 p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md mb-10 text-left">
          <ul className="space-y-4 mb-8 text-base">
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">📅</span>
              <span><strong className="text-white">모집 마감:</strong> {deadline}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">👥</span>
              <span><strong className="text-white">모집 대상:</strong> 성장하고 싶은 대학생 누구나 (전공 무관)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">📚</span>
              <span><strong className="text-white">커리큘럼:</strong> 4월 ~ 7월 · 월 1회 총 4회차</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">💛</span>
              <span><strong className="text-white">참가비:</strong> 무료 (진짜입니다)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">🎁</span>
              <span><strong className="text-white">크루 혜택:</strong> 카카오톡 커뮤니티 · 현직자 강연 · 수료증 발급</span>
            </li>
          </ul>

          <a
            href="/apply"
            className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-xl text-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/30"
          >
            PROGEN 1기 크루 지원하기 →
          </a>
        </div>

        <p className="text-slate-600 text-sm">
          부담 갖지 마세요. 필요한 클래스만 골라서 참석해도 좋습니다.
        </p>
      </div>
    </section>
  )
}

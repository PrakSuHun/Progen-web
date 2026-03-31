export function CtaBanner() {
  // TODO: 마감일을 .env.local의 NEXT_PUBLIC_DEADLINE_DATE 로 관리 가능
  const deadline = process.env.NEXT_PUBLIC_DEADLINE_DATE || '2026-07-31'

  return (
    <section id="apply" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-purple-900/20 border-t border-white/10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          🚨 지금 바로 탑승하세요!
        </h2>
        <p className="text-xl text-slate-300 mb-10 leading-relaxed">
          AI 시대, 가장 큰 리스크는 &apos;아무것도 하지 않는 것&apos;입니다.<br />
          가장 빠르고 똑똑하게 진화할 크루를 모집합니다.
        </p>

        <div className="bg-slate-900/80 p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md mb-10 text-left">
          <ul className="space-y-4 mb-8 text-lg">
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">📅</span>
              <span><strong className="text-white">모집 마감:</strong> {deadline}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">👥</span>
              <span><strong className="text-white">모집 대상:</strong> 성장하고 싶은 대학생 누구나 (전공 무관)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-purple-400">🎁</span>
              <span><strong className="text-white">혜택:</strong> 실전 템플릿 제공 · API 토큰 지원 · 수료증 발급</span>
            </li>
          </ul>

          <a
            href="/apply"
            className="w-full block text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-xl text-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/30"
          >
            지원서 작성하러 가기 →
          </a>
        </div>
      </div>
    </section>
  )
}

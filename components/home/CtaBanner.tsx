export function CtaBanner() {
  return (
    <section className="py-16 md:py-24 px-5 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-black leading-tight mb-4">
          AI를 쓰는 사람이,<br />
          <span className="text-violet-500">못 쓰는 사람의 자리를 뺏습니다.</span>
        </h2>
        <p className="text-[#666] text-base mb-8">
          무료 · 전공 무관 · 대전 소재 대학생 누구나
        </p>
        <a
          href="/apply"
          className="inline-block px-8 py-4 bg-violet-500 text-white font-bold rounded-full text-base hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/20"
        >
          PROGEN 1기 크루 지원하기 →
        </a>
      </div>
    </section>
  )
}

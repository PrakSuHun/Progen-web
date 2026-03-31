'use client'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">PROGEN</h3>
            <p className="text-slate-400">
              프로젝트 기반 커뮤니티
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">링크</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/" className="hover:text-white transition">홈</a></li>
              <li><a href="/about" className="hover:text-white transition">소개</a></li>
              <li><a href="/apply" className="hover:text-white transition">지원</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">문의</h4>
            <p className="text-slate-400">
              contact@progen.com
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2026 PROGEN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

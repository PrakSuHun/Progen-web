'use client'

const navLinks = [
  ['/', '홈'],
  ['/about', '소개'],
  ['/seminar', '세미나'],
  ['/archive', '아카이브'],
  ['/community', '커뮤니티'],
  ['/recruit', '운영진 모집'],
]

const contactLinks = [
  ['/apply', '크루 지원하기'],
  ['/recruit', '운영진 모집'],
  ['https://open.kakao.com/o/sQqCopki', '카카오 문의'],
]

export function Footer() {
  return (
    <footer className="border-t border-[#e0e0e0] py-12 md:py-16 px-5 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 md:mb-16">
          <div className="md:col-span-2">
            <div className="text-xl font-black text-black mb-3">
              PRO<span className="text-violet-500">GEN</span>
            </div>
            <p className="text-[#999] text-sm leading-relaxed max-w-xs">
              AI 시대, 도구를 지배하는 대학생들의 커뮤니티.<br />
              우리는 기술 가치보다 통찰에 집중합니다.
            </p>
          </div>

          <div>
            <h4 className="text-[#aaa] text-[11px] tracking-widest uppercase mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {navLinks.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-[#666] hover:text-black transition-colors text-sm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[#aaa] text-[11px] tracking-widest uppercase mb-4">Contact</h4>
            <ul className="space-y-2.5">
              {contactLinks.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-[#666] hover:text-black transition-colors text-sm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e0e0e0] pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[#bbb] text-xs">&copy; 2026 PROGEN. All rights reserved.</p>
          <p className="text-[#bbb] text-xs">대전 · 대학생 AI 커뮤니티</p>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PROGEN - 겨울방학 AX 프로젝트 신청',
  description: '행사에 참여하신 분은 이름과 연락처만으로 겨울방학 AX 프로젝트를 신청할 수 있어요.',
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

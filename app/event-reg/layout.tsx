import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PROGEN - 행사 사전 신청',
  description: 'PROGEN 행사에 사전 신청하세요. 크루 또는 게스트로 참여할 수 있습니다.',
  openGraph: {
    title: 'PROGEN - 행사 사전 신청',
    description: 'PROGEN 행사에 사전 신청하세요. 크루 또는 게스트로 참여할 수 있습니다.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

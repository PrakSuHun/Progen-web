import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PROGEN - 현장 출석체크',
  description: '행사 현장에서 출석체크를 진행합니다.',
  openGraph: {
    title: 'PROGEN - 현장 출석체크',
    description: '행사 현장에서 출석체크를 진행합니다.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

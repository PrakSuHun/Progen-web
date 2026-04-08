import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PROGEN - 행사 피드백',
  description: '행사에 대한 솔직한 피드백을 남겨주세요. 익명으로 제출됩니다.',
  openGraph: {
    title: 'PROGEN - 행사 피드백',
    description: '행사에 대한 솔직한 피드백을 남겨주세요. 익명으로 제출됩니다.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

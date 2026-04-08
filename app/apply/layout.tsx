import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PROGEN - 1기 크루 지원',
  description: 'PROGEN 1기 크루에 지원하세요. 대전 소재 대학생이라면 누구나 환영합니다.',
  openGraph: {
    title: 'PROGEN - 1기 크루 지원',
    description: 'PROGEN 1기 크루에 지원하세요. 대전 소재 대학생이라면 누구나 환영합니다.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

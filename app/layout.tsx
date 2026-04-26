import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'PROGEN - AI 시대, 도구를 지배하는 대학생 커뮤니티',
  description: '대전 소재 대학생을 위한 AI·자동화 커뮤니티. 실전 프로젝트, 네트워킹, 세미나까지.',
  openGraph: {
    title: 'PROGEN - AI 시대, 도구를 지배하는 대학생 커뮤니티',
    description: '대전 소재 대학생을 위한 AI·자동화 커뮤니티. 실전 프로젝트, 네트워킹, 세미나까지.',
    siteName: 'PROGEN',
    url: 'https://progen.ai.kr',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="naver-site-verification" content="ed9397ff3f935f9050fbffb502805f167ca8857f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PROGEN" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}

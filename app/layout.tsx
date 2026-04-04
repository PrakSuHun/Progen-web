import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'PROGEN - 1기 크루 모집',
  description: 'PROGEN 커뮤니티 1기 크루 모집 및 행사 관리 플랫폼',
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
        <meta name="theme-color" content="#7c3aed" />
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

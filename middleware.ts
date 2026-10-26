import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminSessionToken } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // /admin 로그인 페이지와 /api/admin/login 은 통과
  if (pathname === '/admin' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next()
  }

  // /admin/** 및 /api/admin/** 는 서명된 세션 쿠키 검증 (값 위조 차단)
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    const ok = await verifyAdminSessionToken(request.cookies.get('admin_session')?.value)
    if (!ok) {
      if (pathname.startsWith('/api/admin/')) {
        return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

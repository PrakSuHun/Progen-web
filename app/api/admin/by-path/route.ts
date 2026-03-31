import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')
  return !!cookie
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: members } = await supabase
      .from('crew_members')
      .select('path')
      .eq('role', 'participant')

    if (!members) {
      return NextResponse.json({ data: [] })
    }

    // 경로별 집계
    const pathCount: Record<string, number> = {}
    for (const m of members) {
      if (m.path) {
        pathCount[m.path] = (pathCount[m.path] || 0) + 1
      }
    }

    const data = Object.entries(pathCount)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('By-path error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

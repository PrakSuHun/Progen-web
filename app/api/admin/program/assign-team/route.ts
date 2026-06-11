import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 등록자 팀 배정/해제. team_id = null 이면 미배정
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { enrollment_id, team_id } = await request.json()
    if (!enrollment_id) {
      return NextResponse.json({ message: 'enrollment_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('program_enrollments')
      .update({ team_id: team_id ?? null })
      .eq('id', enrollment_id)
    if (error) throw error
    return NextResponse.json({ message: team_id ? '팀이 배정되었습니다' : '팀 배정이 해제되었습니다' })
  } catch (error) {
    console.error('program assign-team error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

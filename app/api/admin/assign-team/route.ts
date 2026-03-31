import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const { registration_id, team_name } = await request.json()

    if (!registration_id) {
      return NextResponse.json({ message: '잘못된 요청입니다' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('event_registrations')
      .update({ team_name: team_name ?? null })
      .eq('id', registration_id)

    if (error) throw error

    return NextResponse.json({ message: '팀 배정 완료' })
  } catch (error) {
    console.error('assign-team error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

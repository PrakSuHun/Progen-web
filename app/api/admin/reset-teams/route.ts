import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    let eventId: string | null = null
    try { const body = await request.json(); eventId = body.eventId || null } catch {}
    if (!eventId) eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json({ message: '현재 활성 행사를 찾을 수 없습니다' }, { status: 500 })
    }

    const { error } = await supabase
      .from('event_registrations')
      .update({ team_name: null })
      .eq('event_id', eventId)

    if (error) throw error

    return NextResponse.json({ message: '팀 배정 초기화 완료' })
  } catch (error) {
    console.error('reset-teams error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

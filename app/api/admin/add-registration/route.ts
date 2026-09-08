import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

/** 어드민이 행사 신청자 탭에서 크루를 직접 사전신청에 추가. /api/event-reg crew 모드와 같은 효과 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { eventId, crewId } = await request.json()
    if (!eventId || !crewId) {
      return NextResponse.json({ message: 'eventId와 crewId가 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: crew } = await supabase
      .from('crew_members')
      .select('id, name, phone')
      .eq('id', crewId)
      .maybeSingle()
    if (!crew) {
      return NextResponse.json({ message: '크루를 찾을 수 없습니다' }, { status: 404 })
    }

    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('crew_id', crewId)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ message: '이미 신청된 크루입니다' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, crew_id: crewId, status: '사전신청' }])
      .select()
    if (error) throw error

    // 확정 알림톡은 자동 발송하지 않음(운영 방침, 2026-09-08) — 설정 → 알림톡 발송 탭에서 수동 발송.
    return NextResponse.json({ message: '추가되었습니다', alimtalk: 'pending', data })
  } catch (error) {
    console.error('add-registration error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

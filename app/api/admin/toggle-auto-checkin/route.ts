import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// events.auto_checkin_alimtalk 토글. 신청자 탭 "자동문자" 버튼에서 호출.
// 이 값이 true인 행사가 활성 행사일 때만 /checkin 현장 체크인 시 출석문자(6/7)가 자동 발송된다.
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { eventId, enabled } = await request.json()
    if (!eventId || typeof enabled !== 'boolean') {
      return NextResponse.json({ message: 'eventId와 enabled(boolean)가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('events')
      .update({ auto_checkin_alimtalk: enabled })
      .eq('id', eventId)
    if (error) throw error
    return NextResponse.json({ message: enabled ? '자동 출석문자 ON' : '자동 출석문자 OFF', enabled })
  } catch (error) {
    console.error('toggle-auto-checkin error:', error)
    return NextResponse.json({ message: '변경 중 오류가 발생했습니다' }, { status: 500 })
  }
}

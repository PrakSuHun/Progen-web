import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, sendAlimtalk, programLabel } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 신청 취소 확인(5번) 알림톡 — 운영진이 보증금 탭에서 "취소 알림" 버튼으로 수동 발송.
// 실제 신청 행 삭제는 별도(신청자 탭)에서 운영진이 직접 처리.
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { registration_id } = await request.json()
    if (!registration_id) {
      return NextResponse.json({ message: 'registration_id가 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: reg } = await supabase
      .from('event_registrations')
      .select('id, event_id, crew_id, guest_id')
      .eq('id', registration_id)
      .maybeSingle()

    if (!reg) {
      return NextResponse.json({ message: '신청 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    let name = ''
    let phone = ''
    if (reg.crew_id != null) {
      const { data: c } = await supabase.from('crew_members').select('name, phone').eq('id', reg.crew_id).maybeSingle()
      name = c?.name || '회원'
      phone = c?.phone || ''
    } else if (reg.guest_id) {
      const { data: g } = await supabase.from('guests').select('name, phone').eq('id', reg.guest_id).maybeSingle()
      name = g?.name || '게스트'
      phone = g?.phone || ''
    }
    if (!phone) {
      return NextResponse.json({ message: '연락처를 찾을 수 없습니다' }, { status: 400 })
    }

    let eventTitle = ' '
    if (reg.event_id) {
      const { data: ev } = await supabase.from('events').select('title').eq('id', reg.event_id).maybeSingle()
      eventTitle = ev?.title || ' '
    }

    const result = await sendAlimtalk(
      ALIMTALK.REG_CANCELLED, phone,
      { '#{이름}': name, '#{프로그램명}': programLabel(eventTitle) },
      { crewId: reg.crew_id ?? null, guestId: reg.guest_id ?? null, registrationId: registration_id, eventId: reg.event_id ?? null },
    )

    if (result.skipped && result.reason === 'solapi_not_configured') {
      return NextResponse.json({ message: '솔라피 환경변수(SOLAPI_*)가 설정되지 않아 발송하지 못했습니다', sent: false })
    }
    if (!result.ok) {
      return NextResponse.json({ message: `발송 실패: ${result.error ?? '알 수 없음'}`, sent: false })
    }
    return NextResponse.json({ message: `${name}님께 취소 알림톡 발송 완료`, sent: true })
  } catch (error) {
    console.error('send-cancel-alimtalk error:', error)
    return NextResponse.json({ message: '발송 중 오류가 발생했습니다' }, { status: 500 })
  }
}

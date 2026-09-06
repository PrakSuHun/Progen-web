import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, sendAlimtalk, programLabel } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 보증금 미입금 안내(11번) 알림톡 — 운영진이 보증금 탭 「미입금 알림」 버튼으로 수동 발송 (2026-09-06).
// 전용 템플릿(입금 계좌 + 참석 시 전액 반환 안내) 사용. 게스트 + 미입금 상태에서만 발송.
// 같은 신청 건에 최대 3회까지 — alimtalk_logs의 sent 기록으로 카운트(별도 컬럼 없음).
const MAX_REMINDERS = 3
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
      .select('id, event_id, guest_id, deposit_status')
      .eq('id', registration_id)
      .maybeSingle()

    if (!reg) {
      return NextResponse.json({ message: '신청 정보를 찾을 수 없습니다' }, { status: 404 })
    }
    if (!reg.guest_id) {
      return NextResponse.json({ message: '게스트 신청만 보증금 알림 대상입니다' }, { status: 400 })
    }
    if ((reg.deposit_status ?? '미입금') !== '미입금') {
      return NextResponse.json({ message: '미입금 상태가 아니에요 (이미 입금/환불 처리됨)' }, { status: 409 })
    }

    const { count: sentCount } = await supabase
      .from('alimtalk_logs')
      .select('id', { count: 'exact', head: true })
      .eq('registration_id', registration_id)
      .eq('template_code', ALIMTALK.DEPOSIT_REMINDER.code)
      .eq('status', 'sent')
    if ((sentCount ?? 0) >= MAX_REMINDERS) {
      return NextResponse.json({ message: `미입금 알림은 최대 ${MAX_REMINDERS}회까지만 보낼 수 있어요 (이미 ${sentCount}회 발송)` }, { status: 409 })
    }

    const { data: g } = await supabase.from('guests').select('name, phone').eq('id', reg.guest_id).maybeSingle()
    const name = g?.name || '게스트'
    const phone = g?.phone || ''
    if (!phone) {
      return NextResponse.json({ message: '연락처를 찾을 수 없습니다' }, { status: 400 })
    }

    let eventTitle = ' '
    if (reg.event_id) {
      const { data: ev } = await supabase.from('events').select('title').eq('id', reg.event_id).maybeSingle()
      eventTitle = ev?.title || ' '
    }

    const result = await sendAlimtalk(
      ALIMTALK.DEPOSIT_REMINDER, phone,
      { '#{이름}': name, '#{프로그램명}': programLabel(eventTitle) },
      { guestId: reg.guest_id, registrationId: registration_id, eventId: reg.event_id ?? null },
    )

    if (result.skipped && result.reason === 'solapi_not_configured') {
      return NextResponse.json({ message: '솔라피 환경변수(SOLAPI_*)가 설정되지 않아 발송하지 못했습니다', sent: false })
    }
    if (!result.ok) {
      return NextResponse.json({ message: `발송 실패: ${result.error ?? '알 수 없음'}`, sent: false })
    }
    const newCount = (sentCount ?? 0) + 1
    return NextResponse.json({ message: `${name}님께 미입금 알림톡 발송 완료 (${newCount}/${MAX_REMINDERS}회)`, sent: true, count: newCount })
  } catch (error) {
    console.error('send-deposit-reminder error:', error)
    return NextResponse.json({ message: '발송 중 오류가 발생했습니다' }, { status: 500 })
  }
}

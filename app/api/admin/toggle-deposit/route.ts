import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, sendAlimtalk, loadEventRow, programLabel } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

const NEXT_STATUS: Record<string, string> = {
  '미입금': '입금',
  '입금': '환불',
  '환불': '미입금',
}

export async function POST(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { registration_id } = await request.json()
    if (!registration_id) {
      return NextResponse.json({ message: 'registration_id가 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: row, error: readError } = await supabase
      .from('event_registrations')
      .select('deposit_status, guest_id, event_id, status')
      .eq('id', registration_id)
      .single()

    if (readError || !row) {
      return NextResponse.json({ message: '등록 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    const current = row.deposit_status || '미입금'
    const next = NEXT_STATUS[current] ?? '미입금'

    const { error } = await supabase
      .from('event_registrations')
      .update({
        deposit_status: next,
        deposit_paid_at: new Date().toISOString(),
      })
      .eq('id', registration_id)

    if (error) throw error

    // 미입금 → 입금: 입금완료 안내(2번 신규)만 자동 발송 — 확정(3번)은 설정 탭에서 수동(운영 방침, 2026-09-08)
    if (current === '미입금' && next === '입금' && row.guest_id && row.event_id && row.status !== '노쇼확정') {
      try {
        const { data: guest } = await supabase
          .from('guests').select('name, phone').eq('id', row.guest_id).maybeSingle()
        const ev = await loadEventRow(row.event_id)
        if (guest?.phone) {
          await sendAlimtalk(
            ALIMTALK.DEPOSIT_RECEIVED, guest.phone,
            { '#{이름}': guest.name || '게스트', '#{프로그램명}': programLabel(ev?.title ?? null) },
            { guestId: row.guest_id, registrationId: registration_id, eventId: row.event_id },
          )
        }
      } catch (e) {
        console.error('toggle-deposit deposit-received alimtalk failed:', e)
      }
    }

    return NextResponse.json({ message: `${next}으로 변경됨`, deposit_status: next })
  } catch (error) {
    console.error('cycle-deposit error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

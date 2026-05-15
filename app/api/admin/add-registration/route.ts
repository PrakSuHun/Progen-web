import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, sendAlimtalk, loadEventRow, eventConfirmReady, varsEventConfirmed } from '@/lib/solapi'
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

    // 행사정보가 다 채워졌으면 2번(크루용 참석 확정) 알림톡 자동 발송 — /api/event-reg crew 흐름과 동일
    const registrationId: string | null = data?.[0]?.id ?? null
    let alimtalk: 'sent' | 'pending' | 'skipped' = 'skipped'
    try {
      const ev = await loadEventRow(eventId)
      if (ev && crew.phone) {
        if (eventConfirmReady(ev)) {
          const r = await sendAlimtalk(ALIMTALK.EVENT_CONFIRMED_CREW, crew.phone, varsEventConfirmed(ev, crew.name || '회원'), {
            crewId: crew.id, registrationId, eventId,
          })
          alimtalk = r.ok ? 'sent' : 'skipped'
        } else {
          alimtalk = 'pending'
        }
      }
    } catch (e) {
      console.error('add-registration alimtalk send failed:', e)
    }

    return NextResponse.json({ message: '추가되었습니다', alimtalk, data })
  } catch (error) {
    console.error('add-registration error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

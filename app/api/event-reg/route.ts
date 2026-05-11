import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import {
  ALIMTALK, sendAlimtalk, loadEventRow, eventConfirmReady,
  varsEventRegReceived, varsEventConfirmed,
} from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, name, phone, age, school, grade, major, path, gender, refund_bank, refund_account } = body

    if (!mode || !name || !phone) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    if (mode === 'guest' && !age) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json(
        { message: '현재 활성 행사를 찾을 수 없습니다' },
        { status: 500 }
      )
    }

    let crewId: string | null = null
    let guestId: string | null = null

    if (mode === 'crew') {
      // Find crew member by name and phone
      const { data: crewMember, error: crewError } = await supabase
        .from('crew_members')
        .select('id')
        .eq('name', name)
        .eq('phone', phone)
        .single()

      if (crewError || !crewMember) {
        return NextResponse.json(
          { message: '크루 정보를 찾을 수 없습니다. 먼저 지원해주세요.' },
          { status: 404 }
        )
      }

      crewId = crewMember.id
    } else if (mode === 'guest') {
      // Upsert guest (source_event_id only set on first insert)
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('phone', phone)
        .maybeSingle()

      let guest
      let guestError
      if (existingGuest) {
        // Update existing guest info but keep source_event_id
        const { data: g, error: e } = await supabase
          .from('guests')
          .update({ name, age, school: school || null, grade: grade || null, major: major || null, path: path || null, gender: gender || null })
          .eq('phone', phone)
          .select('id')
          .single()
        guest = g; guestError = e
      } else {
        // New guest: set source_event_id
        const { data: g, error: e } = await supabase
          .from('guests')
          .insert({ name, phone, age, school: school || null, grade: grade || null, major: major || null, path: path || null, gender: gender || null, source_event_id: eventId })
          .select('id')
          .single()
        guest = g; guestError = e
      }

      if (guestError) {
        throw guestError
      }

      guestId = guest?.id ?? null
    }

    // 중복 신청 명시적 체크
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq(crewId ? 'crew_id' : 'guest_id', (crewId || guestId) as string)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: '이미 신청하셨습니다' },
        { status: 409 }
      )
    }

    // 게스트일 때만 환불 계좌 합쳐서 저장
    const refundCombined = mode === 'guest' && refund_bank && refund_account
      ? `${String(refund_bank).trim()} ${String(refund_account).trim()}`
      : null

    // Insert event registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([
        {
          event_id: eventId,
          crew_id: crewId,
          guest_id: guestId,
          status: '사전신청',
          refund_account: refundCombined,
        },
      ])
      .select()

    if (error) {
      throw error
    }

    // 알림톡: 게스트 → 1번 신청 접수 / 크루 → 행사 정보가 다 채워졌으면 2번 참석 확정 (아니면 보류)
    const registrationId: string | null = data?.[0]?.id ?? null
    try {
      const ev = await loadEventRow(eventId)
      if (ev) {
        if (mode === 'guest') {
          await sendAlimtalk(ALIMTALK.EVENT_REG_RECEIVED, phone, varsEventRegReceived(ev, name), {
            guestId, registrationId, eventId,
          })
        } else if (mode === 'crew' && eventConfirmReady(ev)) {
          await sendAlimtalk(ALIMTALK.EVENT_CONFIRMED, phone, varsEventConfirmed(ev, name), {
            crewId, registrationId, eventId,
          })
        }
      }
    } catch (e) {
      console.error('event-reg alimtalk send failed:', e)
    }

    return NextResponse.json({
      message: '신청이 완료되었습니다',
      data,
    })
  } catch (error) {
    console.error('Event registration error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { ALIMTALK, sendAlimtalk } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      school,
      grade,
      age,
      major,
      path,
      project,
      gender,
      motivation,
    } = body

    // Validate input
    if (!name || !phone || !school || !grade || !age || !major || !path || !project || !gender || !motivation) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check for duplicate by phone
    const { data: existing } = await supabase
      .from('crew_members')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: '이미 지원하셨습니다' },
        { status: 409 }
      )
    }

    // Insert new crew member with source_event_id
    const sourceEventId = await getActiveEventId()
    const { data, error } = await supabase
      .from('crew_members')
      .insert([
        {
          name,
          phone,
          school,
          grade,
          age,
          major,
          path,
          project,
          gender,
          motivation,
          role: 'participant',
          status: '지원완료',
          source_event_id: sourceEventId,
        },
      ])
      .select()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { message: '이미 지원하셨습니다' },
          { status: 409 }
        )
      }
      throw error
    }

    const newCrew = data?.[0]
    if (newCrew) {
      // 같은 연락처의 게스트 기록이 있으면 event_registrations, feedbacks를 크루로 이관
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('phone', phone)
        .single()

      if (existingGuest) {
        // ⚠️ event_registrations 는 크루로 재배정하지 않는다 (2026-08-03).
        // 각 행사 신청은 "신청 시점의 역할(게스트/크루)"로 고정되어야
        //  ① 분석 탭의 게스트/크루 참여율 모수가 흔들리지 않고
        //  ② 게스트로 낸 보증금이 보증금 탭(게스트 전용)에 남아 환불 대상이 유지된다.
        // 게스트→크루 전환 자체는 full-stats 의 crew_conversion_count 가 별도(독립) 집계하므로
        // 여기서 과거 신청을 갈아치우지 않아도 전환율은 정상적으로 나온다.
        await supabase
          .from('feedbacks')
          .update({ crew_id: newCrew.id, guest_id: null })
          .eq('guest_id', existingGuest.id)
      }

      // 알림톡 3번: 크루원 합류 확정 (즉시)
      try {
        await sendAlimtalk(ALIMTALK.CREW_CONFIRMED, phone, { '#{이름}': name }, { crewId: newCrew.id })
      } catch (e) {
        console.error('apply alimtalk send failed:', e)
      }
    }

    return NextResponse.json({
      message: '지원이 완료되었습니다',
      data,
    })
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; details?: string; hint?: string }
    console.error('Apply error code:', err?.code)
    console.error('Apply error message:', err?.message)
    console.error('Apply error details:', err?.details)
    console.error('Apply error hint:', err?.hint)
    return NextResponse.json(
      { message: '오류가 발생했습니다', debug: err?.message },
      { status: 500 }
    )
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
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

    // Insert new crew member
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
        await supabase
          .from('event_registrations')
          .update({ crew_id: newCrew.id, guest_id: null })
          .eq('guest_id', existingGuest.id)

        await supabase
          .from('feedbacks')
          .update({ crew_id: newCrew.id, guest_id: null })
          .eq('guest_id', existingGuest.id)
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

import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, name, phone, age, school, grade, major, path, project, gender, motivation } = body

    if (!mode || !name || !phone || !age) {
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
      // Upsert guest
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .upsert(
          {
            name,
            phone,
            age,
            school: school || null,
            grade: grade || null,
            major: major || null,
            path: path || null,
            project: project || null,
            gender: gender || null,
            motivation: motivation || null,
          },
          { onConflict: 'phone' }
        )
        .select('id')
        .single()

      if (guestError) {
        throw guestError
      }

      guestId = guest.id
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

    // Insert event registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([
        {
          event_id: eventId,
          crew_id: crewId,
          guest_id: guestId,
          status: '사전신청',
        },
      ])
      .select()

    if (error) {
      throw error
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

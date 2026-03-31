import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, age, school, major, walkin } = body

    if (!name || !phone || !age) {
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

    if (walkin) {
      // Walk-in: Register and check in
      let crewId: string | null = null
      let guestId: string | null = null

      // Try to find existing crew member
      const { data: crewMember } = await supabase
        .from('crew_members')
        .select('id')
        .eq('name', name)
        .eq('phone', phone)
        .single()

      if (crewMember) {
        crewId = crewMember.id
      } else {
        // Upsert guest
        const { data: guest } = await supabase
          .from('guests')
          .upsert(
            {
              name,
              phone,
              age,
              school: school || null,
              major: major || null,
            },
            { onConflict: 'phone' }
          )
          .select('id')
          .single()

        if (guest) {
          guestId = guest.id
        }
      }

      // Insert event registration with checked in status
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([
          {
            event_id: eventId,
            crew_id: crewId,
            guest_id: guestId,
            status: '출석완료',
            checked_in_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { message: '이미 출석체크되었습니다' },
            { status: 409 }
          )
        }
        throw error
      }

      return NextResponse.json({
        message: '현장 등록 + 출석 완료',
        name,
        data,
      })
    } else {
      // Regular check-in from pre-registration
      let crewId: string | null = null
      let guestId: string | null = null

      // Try to find crew member
      const { data: crewMember } = await supabase
        .from('crew_members')
        .select('id')
        .eq('phone', phone)
        .single()

      if (crewMember) {
        crewId = crewMember.id
      } else {
        // Try to find guest
        const { data: guest } = await supabase
          .from('guests')
          .select('id')
          .eq('phone', phone)
          .single()

        if (guest) {
          guestId = guest.id
        }
      }

      if (!crewId && !guestId) {
        return NextResponse.json(
          { message: '사전 신청 정보를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      // Find and update registration
      const { data: registrations, error: findError } = await supabase
        .from('event_registrations')
        .select('id, status')
        .eq('event_id', eventId)
        .or(crewId ? `crew_id.eq.${crewId}` : `guest_id.eq.${guestId}`)
        .single()

      if (!registrations) {
        return NextResponse.json(
          { message: '사전 신청 정보를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      if (registrations.status === '출석완료') {
        return NextResponse.json(
          { message: '이미 출석체크되었습니다', name },
          { status: 409 }
        )
      }

      // Update status to checked in
      const { error: updateError } = await supabase
        .from('event_registrations')
        .update({
          status: '출석완료',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', registrations.id)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        message: '출석 완료',
        name,
      })
    }
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

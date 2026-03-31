import { createAdminClient } from '@/lib/supabase-admin'
import { getLatestEventId } from '@/lib/getLatestEventId'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, name, phone, age, school, major } = body

    if (!mode || !name || !phone || !age) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const eventId = await getLatestEventId(supabase)

    if (!eventId) {
      return NextResponse.json(
        { message: '진행 중인 행사가 없습니다' },
        { status: 404 }
      )
    }

    let crewId: string | null = null
    let guestId: string | null = null

    if (mode === 'crew') {
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
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .upsert(
          { name, phone, age, school: school || null, major: major || null },
          { onConflict: 'phone' }
        )
        .select('id')
        .single()

      if (guestError) throw guestError
      guestId = guest.id
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, crew_id: crewId, guest_id: guestId, status: '사전신청' }])
      .select()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: '이미 신청하셨습니다' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ message: '신청이 완료되었습니다', data })
  } catch (error) {
    console.error('Event registration error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

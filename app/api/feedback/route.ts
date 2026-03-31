import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      score_overall,
      score_content,
      score_practice,
      score_network,
      good_tags,
      good_points,
      bad_tags,
      bad_points,
      would_return,
      join_interest,
    } = body

    if (!name || !phone || !score_overall) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const eventId = process.env.NEXT_PUBLIC_EVENT_ID

    if (!eventId) {
      return NextResponse.json(
        { message: '행사 ID가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    let crewId: string | null = null
    let guestId: string | null = null

    // Find crew member or guest
    const { data: crewMember } = await supabase
      .from('crew_members')
      .select('id')
      .eq('phone', phone)
      .single()

    if (crewMember) {
      crewId = crewMember.id
    } else {
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
        { message: '사전 신청 또는 출석 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('feedbacks')
      .insert([
        {
          event_id: eventId,
          crew_id: crewId,
          guest_id: guestId,
          score_overall,
          score_content,
          score_practice,
          score_network,
          good_tags: Array.isArray(good_tags) ? good_tags : [],
          good_points,
          bad_tags: Array.isArray(bad_tags) ? bad_tags : [],
          bad_points,
          would_return,
          join_interest,
        },
      ])
      .select()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { message: '이미 피드백을 제출하셨습니다' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({
      message: '피드백이 저장되었습니다',
      data,
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

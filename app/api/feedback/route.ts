import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { good_points, bad_points, good_tags, bad_tags, would_return, join_interest } = body

    if (!good_points?.trim() || !bad_points?.trim()) {
      return NextResponse.json(
        { message: '좋았던 점과 아쉬운 점을 모두 입력해주세요' },
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

    const { error } = await supabase
      .from('feedbacks')
      .insert([
        {
          event_id: eventId,
          crew_id: null,
          guest_id: null,
          good_tags: Array.isArray(good_tags) ? good_tags : [],
          good_points: good_points.trim(),
          bad_tags: Array.isArray(bad_tags) ? bad_tags : [],
          bad_points: bad_points.trim(),
          would_return: would_return ?? false,
          join_interest: join_interest ?? false,
        },
      ])

    if (error) {
      throw error
    }

    return NextResponse.json({ message: '피드백이 저장되었습니다' })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

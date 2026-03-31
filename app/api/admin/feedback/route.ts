import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')
  return !!cookie
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json({ message: '현재 활성 행사를 찾을 수 없습니다' }, { status: 500 })
    }

    const { data: feedbacks } = await supabase
      .from('feedbacks')
      .select('good_tags, bad_tags, good_points, bad_points, would_return, join_interest')
      .eq('event_id', eventId)

    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json({
        good_tags: [],
        bad_tags: [],
        responses: [],
        would_return_count: 0,
        join_interest_count: 0,
        total: 0,
      })
    }

    // 태그 빈도 집계
    const goodTagCount: Record<string, number> = {}
    const badTagCount: Record<string, number> = {}

    for (const f of feedbacks) {
      if (Array.isArray(f.good_tags)) {
        for (const tag of f.good_tags) goodTagCount[tag] = (goodTagCount[tag] || 0) + 1
      }
      if (Array.isArray(f.bad_tags)) {
        for (const tag of f.bad_tags) badTagCount[tag] = (badTagCount[tag] || 0) + 1
      }
    }

    const toSortedArray = (map: Record<string, number>) =>
      Object.entries(map)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total: feedbacks.length,
      would_return_count: feedbacks.filter((f) => f.would_return).length,
      join_interest_count: feedbacks.filter((f) => f.join_interest).length,
      good_tags: toSortedArray(goodTagCount),
      bad_tags: toSortedArray(badTagCount),
      responses: feedbacks.map((f) => ({
        good_points: f.good_points,
        bad_points: f.bad_points,
      })),
    })
  } catch (error) {
    console.error('Feedback admin error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

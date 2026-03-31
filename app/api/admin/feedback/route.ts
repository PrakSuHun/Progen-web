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
      .select('score_overall, score_content, score_practice, score_network, good_tags, bad_tags, good_points, bad_points')
      .eq('event_id', eventId)

    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json({
        avg_overall: 0,
        avg_content: 0,
        avg_practice: 0,
        avg_network: 0,
        good_tags: [],
        bad_tags: [],
        responses: [],
      })
    }

    const count = feedbacks.length
    const avg = (key: keyof typeof feedbacks[0]) =>
      feedbacks.reduce((sum, f) => sum + (Number(f[key]) || 0), 0) / count

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
      avg_overall: avg('score_overall'),
      avg_content: avg('score_content'),
      avg_practice: avg('score_practice'),
      avg_network: avg('score_network'),
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

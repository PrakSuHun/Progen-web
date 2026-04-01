import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

function countBy<T>(arr: T[], key: (item: T) => string) {
  const map: Record<string, number> = {}
  for (const item of arr) {
    const k = key(item) || '기타'
    map[k] = (map[k] || 0) + 1
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const paramEventId = request.nextUrl.searchParams.get('eventId')
    const eventId = paramEventId || await getActiveEventId()

    if (!eventId) {
      return NextResponse.json({ message: '현재 활성 행사를 찾을 수 없습니다' }, { status: 500 })
    }

    // 섹션 1: 오늘 행사 출석자 분석
    const { data: registrations } = await supabase
      .from('event_registrations')
      .select(`
        crew_id, guest_id,
        crew_members ( school, grade, path, gender, is_member ),
        guests ( school, grade, path, gender )
      `)
      .eq('event_id', eventId)
      .eq('status', '출석완료')

    const attendees = (registrations ?? []).map((r: any) => {
      const crew = r.crew_members
      const guest = r.guests
      const p = crew || guest
      return {
        school: p?.school ?? '',
        grade: p?.grade ?? '',
        path: p?.path ?? '',
        gender: p?.gender ?? '',
        is_member: crew?.is_member ?? false,
      }
    })

    const saengmyung = attendees.filter((a) => !a.is_member)

    const section1 = {
      all: {
        school: countBy(attendees, (a) => a.school),
        grade: countBy(attendees, (a) => a.grade),
        path: countBy(attendees, (a) => a.path),
        gender: countBy(attendees, (a) => a.gender),
      },
      saengmyung: {
        school: countBy(saengmyung, (a) => a.school),
        grade: countBy(saengmyung, (a) => a.grade),
        path: countBy(saengmyung, (a) => a.path),
        gender: countBy(saengmyung, (a) => a.gender),
      },
    }

    // 섹션 2: 게스트 & 크루 전환 분석
    const [{ count: totalGuests }, { count: guestAttended }, { data: guestPhones }, { count: totalSaengmyung }] =
      await Promise.all([
        supabase.from('guests').select('*', { count: 'exact', head: true }),
        supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('status', '출석완료')
          .not('guest_id', 'is', null),
        supabase.from('guests').select('phone'),
        supabase
          .from('crew_members')
          .select('*', { count: 'exact', head: true })
          .or('is_member.is.false,is_member.is.null'),
      ])

    let crewConversionCount = 0
    if (guestPhones && guestPhones.length > 0) {
      const phones = guestPhones.map((g: any) => g.phone)
      const { count } = await supabase
        .from('crew_members')
        .select('*', { count: 'exact', head: true })
        .in('phone', phones)
      crewConversionCount = count ?? 0
    }

    const section2 = {
      total_guests: totalGuests ?? 0,
      guest_attended: guestAttended ?? 0,
      guest_attendance_rate: totalGuests ? Math.round(((guestAttended ?? 0) / totalGuests) * 100) : 0,
      crew_conversion_count: crewConversionCount,
      crew_conversion_rate: (totalGuests ?? 0) > 0 ? Math.round((crewConversionCount / (totalGuests ?? 1)) * 100) : 0,
      total_saengmyung: totalSaengmyung ?? 0,
    }

    // 섹션 3: 피드백 분석
    const { data: feedbacks } = await supabase
      .from('feedbacks')
      .select('good_tags, bad_tags, good_points, bad_points, would_return, join_interest')
      .eq('event_id', eventId)

    const goodTagCount: Record<string, number> = {}
    const badTagCount: Record<string, number> = {}
    for (const f of feedbacks ?? []) {
      if (Array.isArray(f.good_tags)) {
        for (const tag of f.good_tags) goodTagCount[tag] = (goodTagCount[tag] || 0) + 1
      }
      if (Array.isArray(f.bad_tags)) {
        for (const tag of f.bad_tags) badTagCount[tag] = (badTagCount[tag] || 0) + 1
      }
    }
    const toSorted = (map: Record<string, number>) =>
      Object.entries(map).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count)

    const section3 = {
      total_responses: feedbacks?.length ?? 0,
      would_return_count: feedbacks?.filter((f) => f.would_return).length ?? 0,
      join_interest_count: feedbacks?.filter((f) => f.join_interest).length ?? 0,
      good_tags: toSorted(goodTagCount),
      bad_tags: toSorted(badTagCount),
      responses: (feedbacks ?? []).map((f) => ({ good_points: f.good_points, bad_points: f.bad_points })),
    }

    return NextResponse.json({ section1, section2, section3 })
  } catch (error) {
    console.error('full-stats error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

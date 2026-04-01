import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

function countBy(arr: any[], key: (item: any) => string) {
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

    // 섹션 1: 이 행사의 모든 참여자 분석 (사전신청 + 출석완료 모두 포함)
    const { data: registrations } = await supabase
      .from('event_registrations')
      .select(`
        status, crew_id, guest_id,
        crew_members ( school, grade, path, gender, is_member ),
        guests ( school, grade, path, gender )
      `)
      .eq('event_id', eventId)

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
        status: r.status,
        is_crew: !!crew,
      }
    })

    const saengmyung = attendees.filter((a: any) => !a.is_member)

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

    // 섹션 2: 이 행사의 게스트 & 크루 전환 분석
    const eventGuests = attendees.filter((a: any) => !a.is_crew)
    const eventGuestsAttended = eventGuests.filter((a: any) => a.status === '출석완료')
    const eventCrews = attendees.filter((a: any) => a.is_crew)
    const eventCrewsNonMember = eventCrews.filter((a: any) => !a.is_member)

    const section2 = {
      total_registrations: attendees.length,
      total_crews: eventCrews.length,
      total_guests: eventGuests.length,
      guest_attended: eventGuestsAttended.length,
      guest_attendance_rate: eventGuests.length > 0 ? Math.round((eventGuestsAttended.length / eventGuests.length) * 100) : 0,
      checked_in_count: attendees.filter((a: any) => a.status === '출석완료').length,
      total_saengmyung: eventCrewsNonMember.length,
    }

    // 섹션 3: 피드백 분석
    const { data: feedbacks } = await supabase
      .from('feedbacks')
      .select('good_tags, bad_tags, good_points, bad_points, would_return, join_interest')
      .eq('event_id', eventId)

    const goodTagCount: Record<string, number> = {}
    const badTagCount: Record<string, number> = {}
    for (const f of feedbacks ?? []) {
      if (Array.isArray((f as any).good_tags)) {
        for (const tag of (f as any).good_tags) goodTagCount[tag] = (goodTagCount[tag] || 0) + 1
      }
      if (Array.isArray((f as any).bad_tags)) {
        for (const tag of (f as any).bad_tags) badTagCount[tag] = (badTagCount[tag] || 0) + 1
      }
    }
    const toSorted = (map: Record<string, number>) =>
      Object.entries(map).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count)

    const section3 = {
      total_responses: feedbacks?.length ?? 0,
      would_return_count: feedbacks?.filter((f: any) => f.would_return).length ?? 0,
      join_interest_count: feedbacks?.filter((f: any) => f.join_interest).length ?? 0,
      good_tags: toSorted(goodTagCount),
      bad_tags: toSorted(badTagCount),
      responses: (feedbacks ?? []).map((f: any) => ({ good_points: f.good_points, bad_points: f.bad_points })),
    }

    return NextResponse.json({ section1, section2, section3 })
  } catch (error) {
    console.error('full-stats error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}
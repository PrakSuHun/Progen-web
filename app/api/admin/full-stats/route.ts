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

    // ── 섹션 1: 이 행사 참여자(event_registrations) 기반 분석 ──
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

    const nonMembers = attendees.filter((a: any) => !a.is_member)

    const section1 = {
      all: {
        school: countBy(attendees, (a) => a.school),
        grade: countBy(attendees, (a) => a.grade),
        path: countBy(attendees, (a) => a.path),
        gender: countBy(attendees, (a) => a.gender),
      },
      saengmyung: {
        school: countBy(nonMembers, (a) => a.school),
        grade: countBy(nonMembers, (a) => a.grade),
        path: countBy(nonMembers, (a) => a.path),
        gender: countBy(nonMembers, (a) => a.gender),
      },
    }

    // ── 섹션 2: 이 행사 기준 게스트 & 크루 통계 ──
    // event_registrations에서 이 행사의 크루/게스트 분리
    const eventCrews = attendees.filter((a: any) => a.is_crew)
    const eventGuests = attendees.filter((a: any) => !a.is_crew)
    const eventGuestsCheckedIn = eventGuests.filter((a: any) => a.status === '출석완료')
    const totalCheckedIn = attendees.filter((a: any) => a.status === '출석완료').length

    // source_event_id 기반: 이 행사를 계기로 크루 가입한 수
    const { count: crewFromThisEvent } = await supabase
      .from('crew_members')
      .select('*', { count: 'exact', head: true })
      .eq('source_event_id', eventId)

    // source_event_id 기반: 이 행사를 계기로 처음 온 게스트 수
    const { count: guestsFromThisEvent } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('source_event_id', eventId)

    // 이 행사 게스트 중 나중에 크루로 전환한 수 (phone 매칭)
    const guestIdsInEvent = (registrations ?? [])
      .filter((r: any) => r.guest_id)
      .map((r: any) => r.guest_id)

    let crewConversionCount = 0
    if (guestIdsInEvent.length > 0) {
      const { data: guestPhones } = await supabase
        .from('guests')
        .select('phone')
        .in('id', guestIdsInEvent)

      if (guestPhones && guestPhones.length > 0) {
        const phones = guestPhones.map((g: any) => g.phone)
        const { count } = await supabase
          .from('crew_members')
          .select('*', { count: 'exact', head: true })
          .in('phone', phones)
        crewConversionCount = count ?? 0
      }
    }

    const section2 = {
      total_registrations: attendees.length,
      checked_in_count: totalCheckedIn,
      total_crews: eventCrews.length,
      total_guests: eventGuests.length,
      guest_attended: eventGuestsCheckedIn.length,
      guest_attendance_rate: eventGuests.length > 0
        ? Math.round((eventGuestsCheckedIn.length / eventGuests.length) * 100) : 0,
      crew_from_event: crewFromThisEvent ?? 0,
      guests_from_event: guestsFromThisEvent ?? 0,
      crew_conversion_count: crewConversionCount,
      crew_conversion_rate: eventGuests.length > 0
        ? Math.round((crewConversionCount / eventGuests.length) * 100) : 0,
    }

    // ── 섹션 3: 피드백 분석 ──
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
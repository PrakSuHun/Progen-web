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

    // ── 크루 전체 분석 모드 ──
    if (paramEventId === 'crew-all') {
      const { data: crews } = await supabase
        .from('crew_members')
        .select('name, phone, school, grade, age, major, path, project, gender, is_member, noshow_count, created_at')

      const all = crews ?? []
      const podo = all.filter((c: any) => c.is_member)
      const nonPodo = all.filter((c: any) => !c.is_member)

      const section1 = {
        all: {
          school: countBy(all, (a) => a.school),
          grade: countBy(all, (a) => a.grade),
          path: countBy(all, (a) => a.path),
          gender: countBy(all, (a) => a.gender),
        },
        saengmyung: {
          school: countBy(nonPodo, (a) => a.school),
          grade: countBy(nonPodo, (a) => a.grade),
          path: countBy(nonPodo, (a) => a.path),
          gender: countBy(nonPodo, (a) => a.gender),
        },
      }

      const maleAll = all.filter((c: any) => c.gender === '남성').length
      const femaleAll = all.filter((c: any) => c.gender === '여성').length
      const maleNonPodo = nonPodo.filter((c: any) => c.gender === '남성').length
      const femaleNonPodo = nonPodo.filter((c: any) => c.gender === '여성').length

      // 관심 프로젝트 분포
      const projectDist = countBy(all, (a) => a.project)

      const section2 = {
        total_registrations: all.length,
        checked_in_count: podo.length,
        total_crews: nonPodo.length,
        total_guests: 0,
        guest_attended: maleAll,
        guest_attendance_rate: femaleAll,
        crew_from_event: maleNonPodo,
        guests_from_event: femaleNonPodo,
        crew_conversion_count: 0,
        crew_conversion_rate: 0,
        // labels for crew mode
        _crew_mode: true,
      }

      const section3 = {
        total_responses: 0,
        would_return_count: 0,
        join_interest_count: 0,
        good_tags: projectDist.map((d: any) => ({ tag: d.name, count: d.count })),
        bad_tags: [] as any[],
        responses: [] as any[],
        _crew_mode: true,
      }

      return NextResponse.json({ section1, section2, section3 })
    }

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

    // ── 섹션 2: 이 행사 기준 통계 (event_registrations 기반) ──
    const eventCrews = attendees.filter((a: any) => a.is_crew)
    const eventGuests = attendees.filter((a: any) => !a.is_crew)
    const eventCrewsCheckedIn = eventCrews.filter((a: any) => a.status === '출석완료')
    const eventGuestsCheckedIn = eventGuests.filter((a: any) => a.status === '출석완료')
    const totalCheckedIn = attendees.filter((a: any) => a.status === '출석완료').length

    // 이 행사 참가자들의 phone 수집
    const { data: regsFull } = await supabase
      .from('event_registrations')
      .select(`
        crew_id, guest_id, status,
        crew_members ( phone ),
        guests ( phone )
      `)
      .eq('event_id', eventId)

    const thisEventPeople = (regsFull ?? []).map((r: any) => ({
      phone: r.crew_members?.phone ?? r.guests?.phone ?? '',
      is_crew: !!r.crew_id,
      status: r.status,
    })).filter((p: any) => p.phone && !p.phone.startsWith('PODO-'))

    const thisEventPhones = thisEventPeople.map((p: any) => p.phone)

    // 이전 행사에 참여한 적 있는 phone 수집 (crew_id, guest_id 모두 확인)
    const prevPhoneSet = new Set<string>()
    if (thisEventPhones.length > 0) {
      const { data: prevCrewRegs } = await supabase
        .from('event_registrations')
        .select('crew_members ( phone )')
        .neq('event_id', eventId)
        .eq('status', '출석완료')
        .not('crew_id', 'is', null)
      for (const r of prevCrewRegs ?? []) {
        if ((r as any).crew_members?.phone) prevPhoneSet.add((r as any).crew_members.phone)
      }
      const { data: prevGuestRegs } = await supabase
        .from('event_registrations')
        .select('guests ( phone )')
        .neq('event_id', eventId)
        .eq('status', '출석완료')
        .not('guest_id', 'is', null)
      for (const r of prevGuestRegs ?? []) {
        if ((r as any).guests?.phone) prevPhoneSet.add((r as any).guests.phone)
      }
    }

    const firstTimeCrew = thisEventPeople.filter((p: any) => p.is_crew && !prevPhoneSet.has(p.phone))
    const firstTimeGuest = thisEventPeople.filter((p: any) => !p.is_crew && !prevPhoneSet.has(p.phone))
    const firstTimeCrewCount = firstTimeCrew.length
    const firstTimeCrewCheckedIn = firstTimeCrew.filter((p: any) => p.status === '출석완료').length
    const firstTimeGuestCount = firstTimeGuest.length
    const firstTimeGuestCheckedIn = firstTimeGuest.filter((p: any) => p.status === '출석완료').length

    // 게스트→크루 전환: 이 행사에 출석 + guests에 phone 있음 + 이 행사 이후 크루 가입한 사람
    // 행사 날짜 조회
    const { data: eventInfo } = await supabase
      .from('events')
      .select('event_date')
      .eq('id', eventId)
      .single()
    const eventDate = eventInfo?.event_date ?? new Date().toISOString()

    const allCheckedInPhones = thisEventPeople
      .filter((p: any) => p.status === '출석완료')
      .map((p: any) => p.phone)
      .filter((p: string) => !p.startsWith('PODO-'))

    let crewConversionCount = 0
    if (allCheckedInPhones.length > 0) {
      const { data: guestRecords } = await supabase
        .from('guests')
        .select('phone')
        .in('phone', allCheckedInPhones)
      const guestPhoneSet = new Set((guestRecords ?? []).map((g: any) => g.phone))

      if (guestPhoneSet.size > 0) {
        // 크루 가입일이 행사 날짜 이후인 사람만
        const { data: crewRecords } = await supabase
          .from('crew_members')
          .select('phone')
          .in('phone', [...guestPhoneSet])
          .gte('created_at', eventDate)
        crewConversionCount = (crewRecords ?? []).length
      }
    }

    const section2 = {
      total_registrations: attendees.length,
      checked_in_count: totalCheckedIn,
      total_crews: eventCrews.length,
      crew_checked_in: eventCrewsCheckedIn.length,
      total_guests: eventGuests.length,
      guest_attended: eventGuestsCheckedIn.length,
      guest_attendance_rate: eventGuests.length > 0
        ? Math.round((eventGuestsCheckedIn.length / eventGuests.length) * 100) : 0,
      first_time_crew: firstTimeCrewCount,
      first_time_crew_checked_in: firstTimeCrewCheckedIn,
      first_time_guest: firstTimeGuestCount,
      first_time_guest_checked_in: firstTimeGuestCheckedIn,
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
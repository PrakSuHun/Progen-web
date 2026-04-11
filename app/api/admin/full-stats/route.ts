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
        crew_members ( phone, school, grade, path, gender, is_member ),
        guests ( phone, school, grade, path, gender )
      `)
      .eq('event_id', eventId)

    // 포도 phone 목록 (크루 테이블 기반)
    const { data: podoListEarly } = await supabase
      .from('crew_members')
      .select('phone')
      .eq('is_member', true)
    const podoPhoneSetEarly = new Set((podoListEarly ?? []).map((c: any) => c.phone))

    const attendees = (registrations ?? []).map((r: any) => {
      const crew = r.crew_members
      const guest = r.guests
      const p = crew || guest
      const phone = guest?.phone ?? crew?.phone ?? ''
      return {
        school: p?.school ?? '',
        grade: p?.grade ?? '',
        path: p?.path ?? '',
        gender: p?.gender ?? '',
        is_member: crew?.is_member || podoPhoneSetEarly.has(phone) || phone.startsWith('PODO-'),
        status: r.status,
        is_crew: !!crew,
      }
    })

    // 포도 제외한 일반 참가자만
    const nonPodo = attendees.filter((a: any) => !a.is_member)

    const nonPodoCrew = nonPodo.filter((a: any) => a.is_crew)
    const nonPodoGuest = nonPodo.filter((a: any) => !a.is_crew)

    const section1 = {
      all: {
        school: countBy(nonPodo, (a) => a.school),
        grade: countBy(nonPodo, (a) => a.grade),
        path: countBy(nonPodo, (a) => a.path),
        gender: countBy(nonPodo, (a) => a.gender),
      },
      crew: {
        school: countBy(nonPodoCrew, (a) => a.school),
        grade: countBy(nonPodoCrew, (a) => a.grade),
        path: countBy(nonPodoCrew, (a) => a.path),
        gender: countBy(nonPodoCrew, (a) => a.gender),
      },
      guest: {
        school: countBy(nonPodoGuest, (a) => a.school),
        grade: countBy(nonPodoGuest, (a) => a.grade),
        path: countBy(nonPodoGuest, (a) => a.path),
        gender: countBy(nonPodoGuest, (a) => a.gender),
      },
    }

    // ── 섹션 2: 이 행사 기준 통계 (포도 제외) ──
    const eventCrews = nonPodo.filter((a: any) => a.is_crew)
    const eventGuests = nonPodo.filter((a: any) => !a.is_crew)
    const eventCrewsCheckedIn = eventCrews.filter((a: any) => a.status === '출석완료')
    const eventGuestsCheckedIn = eventGuests.filter((a: any) => a.status === '출석완료')
    const totalCheckedIn = nonPodo.filter((a: any) => a.status === '출석완료').length

    // 이 행사 참가자들의 phone 수집 (포도 제외)
    const { data: regsFull } = await supabase
      .from('event_registrations')
      .select(`
        crew_id, guest_id, status,
        crew_members ( phone, is_member ),
        guests ( phone )
      `)
      .eq('event_id', eventId)

    // 포도 phone 목록
    const { data: podoList } = await supabase
      .from('crew_members')
      .select('phone')
      .eq('is_member', true)
    const podoPhoneSet = new Set((podoList ?? []).map((c: any) => c.phone))

    const thisEventPeople = (regsFull ?? []).map((r: any) => ({
      phone: r.crew_members?.phone ?? r.guests?.phone ?? '',
      is_crew: !!r.crew_id,
      status: r.status,
    })).filter((p: any) => p.phone && !p.phone.startsWith('PODO-') && !podoPhoneSet.has(p.phone))

    const thisEventPhones = thisEventPeople.map((p: any) => p.phone)

    // 이 행사 날짜 조회
    const { data: eventInfo } = await supabase
      .from('events')
      .select('event_date')
      .eq('id', eventId)
      .single()
    const eventDate = eventInfo?.event_date ?? new Date().toISOString()

    // 이 행사보다 이전 행사의 event_id 목록
    const { data: prevEvents } = await supabase
      .from('events')
      .select('id')
      .lt('event_date', eventDate)
    const prevEventIds = (prevEvents ?? []).map((e: any) => e.id)

    // 이전 행사에 출석완료한 phone 수집
    const prevPhoneSet = new Set<string>()
    if (thisEventPhones.length > 0 && prevEventIds.length > 0) {
      const { data: prevCrewRegs } = await supabase
        .from('event_registrations')
        .select('crew_members ( phone )')
        .in('event_id', prevEventIds)
        .eq('status', '출석완료')
        .not('crew_id', 'is', null)
      for (const r of prevCrewRegs ?? []) {
        if ((r as any).crew_members?.phone) prevPhoneSet.add((r as any).crew_members.phone)
      }
      const { data: prevGuestRegs } = await supabase
        .from('event_registrations')
        .select('guests ( phone )')
        .in('event_id', prevEventIds)
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

    // ── 누적 크루 계산 ──
    // 이번 행사 전까지의 전체 크루 (포도 제외)
    const { count: crewBeforeEvent } = await supabase
      .from('crew_members')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', eventDate)
      .or('is_member.is.null,is_member.eq.false')

    // 직전 행사 정보
    let betweenEventsCrew = 0
    let prevAccumulated = 0
    const { data: prevEventInfo } = await supabase
      .from('events')
      .select('id, event_date')
      .lt('event_date', eventDate)
      .order('event_date', { ascending: false })
      .limit(1)
      .single()

    if (prevEventInfo) {
      // 직전 행사 이후 크루 가입한 사람 중, 직전 행사 미참석자 이고 현 행사 크루 전환도 아닌 사람 (직접 신청)
      const { data: betweenCrews } = await supabase
        .from('crew_members')
        .select('phone')
        .gte('created_at', prevEventInfo.event_date)
        .lt('created_at', eventDate)
        .or('is_member.is.null,is_member.eq.false')

      // 직전 행사 출석자 phone
      const { data: prevAttended } = await supabase
        .from('event_registrations')
        .select('crew_members ( phone ), guests ( phone )')
        .eq('event_id', prevEventInfo.id)
        .eq('status', '출석완료')
      const prevAttendedPhones = new Set<string>()
      for (const r of prevAttended ?? []) {
        const phone = (r as any).crew_members?.phone ?? (r as any).guests?.phone
        if (phone) prevAttendedPhones.add(phone)
      }

      // 현 행사에 게스트로 출석한 사람의 phone (크루 전환 대상)
      const thisEventGuestPhones = new Set(
        thisEventPeople.filter((p: any) => !p.is_crew && p.status === '출석완료').map((p: any) => p.phone)
      )

      // 직접 신청 = 직전 행사 미참석 + 현 행사 게스트 전환도 아닌 사람
      const directSignups = (betweenCrews ?? []).filter((c: any) =>
        !prevAttendedPhones.has(c.phone) && !thisEventGuestPhones.has(c.phone)
      )
      betweenEventsCrew = directSignups.length

      // 전 행사까지 누적 = 이번 행사 전 전체 비포도 크루 - 이번 기간 직접 신청
      prevAccumulated = (crewBeforeEvent ?? 0) - betweenEventsCrew
    } else {
      // 첫 행사면 이전 누적 = 0
      prevAccumulated = 0
      betweenEventsCrew = crewBeforeEvent ?? 0
    }

    const section2 = {
      total_registrations: nonPodo.length,
      podo_count: attendees.filter((a: any) => a.is_member).length,
      podo_checked_in: attendees.filter((a: any) => a.is_member && a.status === '출석완료').length,
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
      crew_conversion_rate: eventGuestsCheckedIn.length > 0
        ? Math.round((crewConversionCount / eventGuestsCheckedIn.length) * 100) : 0,
      prev_accumulated: prevAccumulated,
      between_events_crew: betweenEventsCrew,
      total_accumulated: prevAccumulated + betweenEventsCrew + crewConversionCount,
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